import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { runs, tasks, transcripts, type NewRun, type NewTranscript } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { generateMockMetrics, createMetricsCollector } from '@/lib/metrics';
import { generateUserMessage, getSimulatorConfig, shouldEndConversation, type SimulatorTurn } from '@/lib/simulator';

// POST /api/eval/run - Start an evaluation run
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { taskId, mode = 'mock' } = body;

        // Validate task exists
        const task = await db.select().from(tasks).where(eq(tasks.id, taskId)).get();
        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Create run record
        const runId = randomUUID();
        const now = new Date();

        const newRun: NewRun = {
            id: runId,
            taskId: task.id,
            status: 'running',
            startTime: now,
        };
        await db.insert(runs).values(newRun);

        // Execute evaluation based on mode
        if (mode === 'mock') {
            // Mock mode: generate simulated data
            await executeMockEval(runId, task);
        } else if (mode === 'simulate') {
            // Simulate mode: use LLM to simulate conversation
            await executeSimulatedEval(runId, task);
        } else {
            // Live mode: connect to real Agora agent (TODO)
            return NextResponse.json({ error: 'Live mode not yet implemented' }, { status: 501 });
        }

        // Return run info for polling
        return NextResponse.json({ runId, status: 'running' });
    } catch (error) {
        console.error('Error starting eval run:', error);
        return NextResponse.json({ error: 'Failed to start evaluation' }, { status: 500 });
    }
}

// GET /api/eval/run?id=xxx - Get run status and results
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const runId = searchParams.get('id');

    if (!runId) {
        return NextResponse.json({ error: 'Run ID required' }, { status: 400 });
    }

    const run = await db.select().from(runs).where(eq(runs.id, runId)).get();
    if (!run) {
        return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }

    const runTranscripts = await db.select().from(transcripts).where(eq(transcripts.runId, runId));

    return NextResponse.json({
        ...run,
        transcripts: runTranscripts,
    });
}

// ==================== Mock Evaluation ====================
async function executeMockEval(runId: string, task: typeof tasks.$inferSelect) {
    // Generate mock conversation
    const mockConversation = [
        { role: 'system' as const, content: `开始评测任务：${task.name}` },
        { role: 'user' as const, content: '你好，我想咨询一下退款的问题' },
        { role: 'agent' as const, content: '好的，我来帮您处理。请问您能提供一下订单号吗？' },
        { role: 'user' as const, content: '订单号是 A20260108001' },
        { role: 'agent' as const, content: '查到了，是1月8日的订单。我现在就帮您申请退款，预计1-3个工作日到账。' },
        { role: 'user' as const, content: '好的谢谢' },
        { role: 'system' as const, content: '✅ 任务完成' },
    ];

    // Save transcripts
    for (let i = 0; i < mockConversation.length; i++) {
        const turn = mockConversation[i];
        const transcript: NewTranscript = {
            id: randomUUID(),
            runId,
            turn: i,
            role: turn.role,
            content: turn.content,
            timestamp: new Date(Date.now() + i * 3000), // 3s between turns
            asrLatency: turn.role === 'user' ? 250 + Math.random() * 100 : null,
            llmLatency: turn.role === 'agent' ? 400 + Math.random() * 200 : null,
            ttsLatency: turn.role === 'agent' ? 300 + Math.random() * 100 : null,
        };
        await db.insert(transcripts).values(transcript);
    }

    // Update run with metrics
    const mockMetrics = generateMockMetrics();
    await db.update(runs)
        .set({
            status: mockMetrics.taskCompletion ? 'passed' : 'failed',
            endTime: new Date(),
            asrLatency: mockMetrics.asrLatency,
            llmTTF: mockMetrics.llmTTF,
            ttsLatency: mockMetrics.ttsLatency,
            e2eLatency: mockMetrics.e2eLatency,
            intentAccuracy: mockMetrics.intentAccuracy,
            taskCompletion: mockMetrics.taskCompletion,
        })
        .where(eq(runs.id, runId));
}

// ==================== Simulated Evaluation ====================
async function executeSimulatedEval(runId: string, task: typeof tasks.$inferSelect) {
    const config = getSimulatorConfig();
    const collector = createMetricsCollector();
    const history: SimulatorTurn[] = [];
    let turnIndex = 0;

    // System start message
    await saveTranscript(runId, turnIndex++, 'system', `开始评测任务：${task.name}`);

    // Conversation loop
    const maxTurns = 10;
    for (let i = 0; i < maxTurns; i++) {
        collector.startTurn();

        // Generate user message
        const userMessage = await generateUserMessage(config, {
            name: task.name,
            description: task.description,
            systemPrompt: task.systemPrompt || undefined,
            checkpoints: task.checkpoints || [],
        }, history);

        history.push({ role: 'user', content: userMessage, timestamp: new Date() });
        await saveTranscript(runId, turnIndex++, 'user', userMessage);

        // Simulate agent response (in real mode, this comes from Agora)
        const agentResponse = `[模拟Agent回复] 收到您的请求：${userMessage.substring(0, 30)}...`;
        history.push({ role: 'assistant', content: agentResponse, timestamp: new Date() });
        await saveTranscript(runId, turnIndex++, 'agent', agentResponse);

        collector.endTurn({
            asrLatency: 250 + Math.random() * 100,
            llmLatency: 400 + Math.random() * 200,
            ttsLatency: 300 + Math.random() * 100,
        });

        // Check if conversation should end
        if (shouldEndConversation({ name: task.name, description: task.description }, history)) {
            break;
        }
    }

    // End message
    await saveTranscript(runId, turnIndex, 'system', '✅ 评测完成');

    // Update run with metrics
    const avgMetrics = collector.getAverageMetrics();
    await db.update(runs)
        .set({
            status: 'passed',
            endTime: new Date(),
            asrLatency: avgMetrics.asrLatency,
            llmTTF: avgMetrics.llmTTF,
            ttsLatency: avgMetrics.ttsLatency,
            e2eLatency: avgMetrics.e2eLatency,
            taskCompletion: true,
        })
        .where(eq(runs.id, runId));
}

async function saveTranscript(
    runId: string,
    turn: number,
    role: 'user' | 'agent' | 'system',
    content: string
) {
    const transcript: NewTranscript = {
        id: randomUUID(),
        runId,
        turn,
        role,
        content,
        timestamp: new Date(),
    };
    await db.insert(transcripts).values(transcript);
}
