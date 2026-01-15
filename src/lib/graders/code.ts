/**
 * Code-based Grader
 * Deterministic rules for evaluating agent performance
 */

import type { Transcript, Run } from '@/db/schema';

export interface GradeResult {
    score: number;         // 0-100
    passed: boolean;
    details: {
        checkpointsPassed: number;
        checkpointsTotal: number;
        intentAccuracy: number;
        latencyPassed: boolean;
        issues: string[];
    };
}

export interface GradingConfig {
    checkpoints: string[];
    maxLatency?: number;      // Max acceptable E2E latency in ms
    minIntentAccuracy?: number; // Minimum intent accuracy (0-1)
}

/**
 * Grade a run using code-based rules
 */
export function gradeWithCode(
    run: Run,
    transcripts: Transcript[],
    config: GradingConfig
): GradeResult {
    const issues: string[] = [];

    // 1. Check checkpoints
    const { passed: checkpointsPassed, total: checkpointsTotal } =
        checkCheckpoints(transcripts, config.checkpoints);

    // 2. Check latency
    const maxLatency = config.maxLatency || 2000;
    const latencyPassed = (run.e2eLatency || 0) <= maxLatency;
    if (!latencyPassed) {
        issues.push(`E2E latency ${run.e2eLatency}ms exceeds threshold ${maxLatency}ms`);
    }

    // 3. Check intent accuracy
    const minIntentAccuracy = config.minIntentAccuracy || 0.8;
    const intentAccuracy = run.intentAccuracy || 0;
    const intentPassed = intentAccuracy >= minIntentAccuracy;
    if (!intentPassed) {
        issues.push(`Intent accuracy ${(intentAccuracy * 100).toFixed(1)}% below threshold ${(minIntentAccuracy * 100)}%`);
    }

    // 4. Check task completion
    if (!run.taskCompletion) {
        issues.push('Task was not completed');
    }

    // Calculate score
    const checkpointScore = checkpointsTotal > 0 ? (checkpointsPassed / checkpointsTotal) * 40 : 40;
    const latencyScore = latencyPassed ? 20 : 0;
    const intentScore = intentAccuracy * 20;
    const completionScore = run.taskCompletion ? 20 : 0;

    const score = checkpointScore + latencyScore + intentScore + completionScore;
    const passed = score >= 70 && run.taskCompletion === true;

    return {
        score: Math.round(score),
        passed,
        details: {
            checkpointsPassed,
            checkpointsTotal,
            intentAccuracy,
            latencyPassed,
            issues,
        },
    };
}

/**
 * Check how many checkpoints were covered in the conversation
 */
function checkCheckpoints(
    transcripts: Transcript[],
    checkpoints: string[]
): { passed: number; total: number } {
    if (checkpoints.length === 0) {
        return { passed: 0, total: 0 };
    }

    const fullText = transcripts.map(t => t.content).join(' ').toLowerCase();

    let passed = 0;
    for (const checkpoint of checkpoints) {
        // Simple keyword matching - can be enhanced with semantic similarity
        const keywords = checkpoint.toLowerCase().split(/\s+/);
        const matchedKeywords = keywords.filter(k => fullText.includes(k));

        // Consider checkpoint passed if >50% keywords matched
        if (matchedKeywords.length >= keywords.length * 0.5) {
            passed++;
        }
    }

    return { passed, total: checkpoints.length };
}

/**
 * Check for conversation quality issues
 */
export function checkConversationQuality(
    transcripts: Transcript[]
): string[] {
    const issues: string[] = [];

    // Check for repeated content
    const agentResponses = transcripts.filter(t => t.role === 'agent').map(t => t.content);
    const uniqueResponses = new Set(agentResponses);
    if (agentResponses.length > uniqueResponses.size) {
        issues.push('Agent repeated the same response');
    }

    // Check for very short responses
    const shortResponses = agentResponses.filter(r => r.length < 10);
    if (shortResponses.length > 0) {
        issues.push(`${shortResponses.length} very short agent responses detected`);
    }

    // Check for error indicators
    const errorPatterns = ['抱歉', '无法', '错误', 'error', 'sorry', 'cannot'];
    const hasErrors = transcripts.some(t =>
        errorPatterns.some(p => t.content.toLowerCase().includes(p))
    );
    if (hasErrors) {
        issues.push('Error indicators found in conversation');
    }

    return issues;
}
