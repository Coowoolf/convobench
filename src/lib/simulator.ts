/**
 * User Simulator - LLM-driven conversation partner for evaluations
 * Generates realistic user inputs based on task definitions
 */

export interface SimulatorConfig {
    llmUrl: string;
    llmKey: string;
    model: string;
}

export interface TaskDefinition {
    name: string;
    description: string;
    systemPrompt?: string;
    checkpoints?: string[];
}

export interface SimulatorTurn {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

/**
 * Get simulator configuration from environment
 */
export function getSimulatorConfig(): SimulatorConfig {
    return {
        llmUrl: process.env.LLM_API_URL || 'https://openrouter.ai/api/v1/chat/completions',
        llmKey: process.env.LLM_API_KEY || '',
        model: process.env.LLM_MODEL || 'anthropic/claude-3.5-sonnet',
    };
}

/**
 * Generate the next user message based on conversation history
 */
export async function generateUserMessage(
    config: SimulatorConfig,
    task: TaskDefinition,
    conversationHistory: SimulatorTurn[]
): Promise<string> {
    const systemPrompt = buildSimulatorPrompt(task, conversationHistory);

    const response = await fetch(config.llmUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.llmKey}`,
        },
        body: JSON.stringify({
            model: config.model,
            messages: [
                { role: 'system', content: systemPrompt },
                ...conversationHistory.map(t => ({
                    role: t.role === 'user' ? 'user' : 'assistant',
                    content: t.content,
                })),
                { role: 'user', content: 'Generate the next user message.' },
            ],
            max_tokens: 200,
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        throw new Error(`LLM API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
}

/**
 * Build the simulator system prompt
 */
function buildSimulatorPrompt(task: TaskDefinition, history: SimulatorTurn[]): string {
    const turnCount = history.filter(t => t.role === 'user').length;

    return `You are simulating a user in a voice agent evaluation scenario.

## Task: ${task.name}
${task.description}

## Checkpoints to cover:
${task.checkpoints?.map((c, i) => `${i + 1}. ${c}`).join('\n') || 'None specified'}

## Your role:
- Act as a realistic user interacting with a voice AI agent
- Be natural and conversational (this is a spoken dialogue)
- Keep responses brief (1-2 sentences typical for voice)
- ${turnCount === 0 ? 'Start the conversation with your initial request' : 'Continue the conversation naturally based on the agent\'s response'}
- Try to cover the checkpoints through the conversation
- If the task seems complete, you can end with a brief acknowledgment

## Important:
- Output ONLY the user's spoken message, nothing else
- Do not include quotation marks or role labels
- Be concise - this is voice, not text chat`;
}

/**
 * Check if conversation should end
 */
export function shouldEndConversation(
    task: TaskDefinition,
    history: SimulatorTurn[],
    maxTurns: number = 10
): boolean {
    // Max turns reached
    if (history.filter(t => t.role === 'user').length >= maxTurns) {
        return true;
    }

    // Check for natural endings
    const lastAgentMessage = [...history].reverse().find(t => t.role === 'assistant');
    if (lastAgentMessage) {
        const endingPhrases = ['再见', '感谢', '祝您', '还有其他', '需要帮助'];
        if (endingPhrases.some(p => lastAgentMessage.content.includes(p))) {
            // Give user one more turn to respond
            const lastUserMessage = [...history].reverse().find(t => t.role === 'user');
            if (lastUserMessage && history.indexOf(lastUserMessage) > history.indexOf(lastAgentMessage)) {
                return true;
            }
        }
    }

    return false;
}
