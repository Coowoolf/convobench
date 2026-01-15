/**
 * Model-based Grader
 * Uses LLM to evaluate conversation quality and task completion
 */

import type { Transcript } from '@/db/schema';

export interface ModelGradeResult {
    score: number;          // 0-100
    passed: boolean;
    rubricScores: {
        taskCompletion: number;   // 0-25
        conversationQuality: number; // 0-25
        empathy: number;          // 0-25
        efficiency: number;       // 0-25
    };
    explanation: string;
}

export interface ModelGradingConfig {
    llmUrl: string;
    llmKey: string;
    model: string;
    taskDescription: string;
    checkpoints?: string[];
}

/**
 * Grade a conversation using LLM
 */
export async function gradeWithModel(
    transcripts: Transcript[],
    config: ModelGradingConfig
): Promise<ModelGradeResult> {
    const prompt = buildGradingPrompt(transcripts, config);

    try {
        const response = await fetch(config.llmUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.llmKey}`,
            },
            body: JSON.stringify({
                model: config.model,
                messages: [
                    { role: 'system', content: GRADING_SYSTEM_PROMPT },
                    { role: 'user', content: prompt },
                ],
                max_tokens: 1000,
                temperature: 0.1, // Low temperature for consistent grading
            }),
        });

        if (!response.ok) {
            throw new Error(`LLM API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || '';

        return parseGradingResponse(content);
    } catch (error) {
        console.error('Model grading failed:', error);
        return {
            score: 0,
            passed: false,
            rubricScores: {
                taskCompletion: 0,
                conversationQuality: 0,
                empathy: 0,
                efficiency: 0,
            },
            explanation: `Grading failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}

const GRADING_SYSTEM_PROMPT = `You are an expert evaluator for voice AI agent conversations. 
Grade the conversation based on the following rubric:

1. Task Completion (0-25): Did the agent successfully complete the user's request?
2. Conversation Quality (0-25): Was the conversation natural, coherent, and appropriate?
3. Empathy (0-25): Did the agent show appropriate emotional intelligence and understanding?
4. Efficiency (0-25): Was the conversation efficient without unnecessary back-and-forth?

Respond in JSON format:
{
  "taskCompletion": <0-25>,
  "conversationQuality": <0-25>,
  "empathy": <0-25>,
  "efficiency": <0-25>,
  "explanation": "<brief explanation of the scores>"
}`;

function buildGradingPrompt(
    transcripts: Transcript[],
    config: ModelGradingConfig
): string {
    const conversation = transcripts
        .filter(t => t.role !== 'system')
        .map(t => `${t.role === 'user' ? 'User' : 'Agent'}: ${t.content}`)
        .join('\n');

    return `## Task Description
${config.taskDescription}

## Checkpoints
${config.checkpoints?.map((c, i) => `${i + 1}. ${c}`).join('\n') || 'None specified'}

## Conversation
${conversation}

Please evaluate this conversation.`;
}

function parseGradingResponse(content: string): ModelGradeResult {
    try {
        // Extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in response');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        const rubricScores = {
            taskCompletion: Math.min(25, Math.max(0, parsed.taskCompletion || 0)),
            conversationQuality: Math.min(25, Math.max(0, parsed.conversationQuality || 0)),
            empathy: Math.min(25, Math.max(0, parsed.empathy || 0)),
            efficiency: Math.min(25, Math.max(0, parsed.efficiency || 0)),
        };

        const score = rubricScores.taskCompletion +
            rubricScores.conversationQuality +
            rubricScores.empathy +
            rubricScores.efficiency;

        return {
            score,
            passed: score >= 70,
            rubricScores,
            explanation: parsed.explanation || '',
        };
    } catch (error) {
        console.error('Failed to parse grading response:', content);
        return {
            score: 0,
            passed: false,
            rubricScores: {
                taskCompletion: 0,
                conversationQuality: 0,
                empathy: 0,
                efficiency: 0,
            },
            explanation: 'Failed to parse grading response',
        };
    }
}

/**
 * Generate mock model grade for testing
 */
export function generateMockModelGrade(): ModelGradeResult {
    const rubricScores = {
        taskCompletion: 18 + Math.floor(Math.random() * 7),   // 18-24
        conversationQuality: 16 + Math.floor(Math.random() * 9), // 16-24
        empathy: 15 + Math.floor(Math.random() * 10),        // 15-24
        efficiency: 17 + Math.floor(Math.random() * 8),      // 17-24
    };

    const score = rubricScores.taskCompletion +
        rubricScores.conversationQuality +
        rubricScores.empathy +
        rubricScores.efficiency;

    return {
        score,
        passed: score >= 70,
        rubricScores,
        explanation: 'Mock grade generated for testing',
    };
}
