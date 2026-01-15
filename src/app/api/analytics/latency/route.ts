import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { runs } from '@/db/schema';
import { gte } from 'drizzle-orm';

// GET /api/analytics/latency - Get latency distribution by date
export async function GET() {
    try {
        // Get runs from the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentRuns = await db
            .select({
                startTime: runs.startTime,
                asrLatency: runs.asrLatency,
                llmTTF: runs.llmTTF,
                ttsLatency: runs.ttsLatency,
            })
            .from(runs)
            .where(gte(runs.startTime, sevenDaysAgo));

        // Group by date
        const byDate = new Map<string, { asr: number[]; llm: number[]; tts: number[] }>();

        for (const run of recentRuns) {
            const date = new Date(run.startTime).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
            if (!byDate.has(date)) {
                byDate.set(date, { asr: [], llm: [], tts: [] });
            }

            const data = byDate.get(date)!;
            if (run.asrLatency != null) data.asr.push(run.asrLatency);
            if (run.llmTTF != null) data.llm.push(run.llmTTF);
            if (run.ttsLatency != null) data.tts.push(run.ttsLatency);
        }

        // Calculate averages
        const avg = (arr: number[]) => arr.length > 0
            ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
            : 0;

        const trend = Array.from(byDate.entries())
            .map(([date, data]) => ({
                date,
                asr: avg(data.asr),
                llm: avg(data.llm),
                tts: avg(data.tts),
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return NextResponse.json(trend);
    } catch (error) {
        console.error('Error fetching latency:', error);
        return NextResponse.json({ error: 'Failed to fetch latency' }, { status: 500 });
    }
}
