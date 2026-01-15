/**
 * Metrics collection for voice agent evaluations
 * Tracks ASR, LLM, TTS, and E2E latencies
 */

export interface MetricsSnapshot {
    asrLatency: number | null;    // ASR processing time (ms)
    llmTTF: number | null;        // LLM time to first token (ms)
    ttsLatency: number | null;    // TTS processing time (ms)
    e2eLatency: number | null;    // End-to-end latency (ms)
    intentAccuracy: number | null; // Intent recognition accuracy (0-1)
    taskCompletion: boolean;       // Whether task was completed
}

export interface TurnMetrics {
    turnIndex: number;
    asrLatency: number | null;
    llmLatency: number | null;
    ttsLatency: number | null;
    startTime: Date;
    endTime: Date;
}

/**
 * Calculate average metrics from a list of turn metrics
 */
export function calculateAverageMetrics(turns: TurnMetrics[]): MetricsSnapshot {
    if (turns.length === 0) {
        return {
            asrLatency: null,
            llmTTF: null,
            ttsLatency: null,
            e2eLatency: null,
            intentAccuracy: null,
            taskCompletion: false,
        };
    }

    const validAsrLatencies = turns.filter(t => t.asrLatency != null).map(t => t.asrLatency!);
    const validLlmLatencies = turns.filter(t => t.llmLatency != null).map(t => t.llmLatency!);
    const validTtsLatencies = turns.filter(t => t.ttsLatency != null).map(t => t.ttsLatency!);

    const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

    const asrAvg = avg(validAsrLatencies);
    const llmAvg = avg(validLlmLatencies);
    const ttsAvg = avg(validTtsLatencies);

    return {
        asrLatency: asrAvg,
        llmTTF: llmAvg,
        ttsLatency: ttsAvg,
        e2eLatency: asrAvg && llmAvg && ttsAvg ? asrAvg + llmAvg + ttsAvg : null,
        intentAccuracy: null, // Calculated by grader
        taskCompletion: false, // Calculated by grader
    };
}

/**
 * Create a metrics collector for a run
 */
export function createMetricsCollector() {
    const turns: TurnMetrics[] = [];
    let currentTurnStart: Date | null = null;
    let currentTurnIndex = 0;

    return {
        startTurn(): void {
            currentTurnStart = new Date();
            currentTurnIndex++;
        },

        endTurn(metrics: Omit<TurnMetrics, 'turnIndex' | 'startTime' | 'endTime'>): void {
            if (!currentTurnStart) {
                console.warn('endTurn called without startTurn');
                return;
            }
            turns.push({
                turnIndex: currentTurnIndex,
                startTime: currentTurnStart,
                endTime: new Date(),
                ...metrics,
            });
            currentTurnStart = null;
        },

        getTurns(): TurnMetrics[] {
            return [...turns];
        },

        getAverageMetrics(): MetricsSnapshot {
            return calculateAverageMetrics(turns);
        },
    };
}

/**
 * Simulate metrics for testing (mock mode)
 */
export function generateMockMetrics(): MetricsSnapshot {
    return {
        asrLatency: 200 + Math.random() * 200,    // 200-400ms
        llmTTF: 300 + Math.random() * 400,        // 300-700ms
        ttsLatency: 150 + Math.random() * 200,    // 150-350ms
        e2eLatency: 800 + Math.random() * 600,    // 800-1400ms
        intentAccuracy: 0.7 + Math.random() * 0.3, // 0.7-1.0
        taskCompletion: Math.random() > 0.2,       // 80% success rate
    };
}
