/**
 * Composite Grader
 * Combines code-based and model-based grading with pass@k metrics
 */

import type { Run, Transcript } from '@/db/schema';
import { gradeWithCode, type GradeResult as CodeGradeResult, type GradingConfig as CodeConfig } from './code';
import { gradeWithModel, generateMockModelGrade, type ModelGradeResult, type ModelGradingConfig } from './model';

export interface CompositeGradeResult {
    score: number;           // 0-100 composite score
    passed: boolean;
    codeGrade: CodeGradeResult;
    modelGrade: ModelGradeResult | null;
    weights: {
        code: number;
        model: number;
    };
}

export interface CompositeConfig {
    codeWeight?: number;      // Default 0.6
    modelWeight?: number;     // Default 0.4
    useModelGrading?: boolean;
    codeConfig: CodeConfig;
    modelConfig?: ModelGradingConfig;
}

/**
 * Grade a run using both code and model graders
 */
export async function gradeComposite(
    run: Run,
    transcripts: Transcript[],
    config: CompositeConfig
): Promise<CompositeGradeResult> {
    const codeWeight = config.codeWeight ?? 0.6;
    const modelWeight = config.modelWeight ?? 0.4;

    // Always run code grader
    const codeGrade = gradeWithCode(run, transcripts, config.codeConfig);

    // Optionally run model grader
    let modelGrade: ModelGradeResult | null = null;
    if (config.useModelGrading && config.modelConfig) {
        modelGrade = await gradeWithModel(transcripts, config.modelConfig);
    }

    // Calculate composite score
    let score: number;
    if (modelGrade) {
        score = codeGrade.score * codeWeight + modelGrade.score * modelWeight;
    } else {
        score = codeGrade.score;
    }

    return {
        score: Math.round(score),
        passed: score >= 70 && codeGrade.passed,
        codeGrade,
        modelGrade,
        weights: { code: codeWeight, model: modelWeight },
    };
}

/**
 * Calculate pass@k metric
 * Probability of at least one success in k attempts
 */
export function calculatePassAtK(
    passRates: number[],
    k: number
): number {
    if (passRates.length === 0 || k <= 0) return 0;

    // Take at most k samples
    const samples = passRates.slice(0, k);
    const n = samples.length;

    // Calculate probability of at least one pass
    // P(at least 1 pass) = 1 - P(all fail)
    const failProb = samples.reduce((acc, p) => acc * (1 - p), 1);
    return 1 - failProb;
}

/**
 * Calculate pass^k metric
 * Probability of all k attempts succeeding
 */
export function calculatePassPowerK(
    passRates: number[],
    k: number
): number {
    if (passRates.length === 0 || k <= 0) return 0;

    // Take at most k samples
    const samples = passRates.slice(0, k);

    // Calculate probability of all passes
    return samples.reduce((acc, p) => acc * p, 1);
}

/**
 * Calculate aggregate metrics for a set of runs
 */
export interface AggregateMetrics {
    totalRuns: number;
    passedRuns: number;
    passRate: number;
    avgScore: number;
    passAt1: number;
    passAt3: number;
    passAt5: number;
    passPower3: number;
}

export function calculateAggregateMetrics(
    runs: Array<{ score: number; passed: boolean }>
): AggregateMetrics {
    if (runs.length === 0) {
        return {
            totalRuns: 0,
            passedRuns: 0,
            passRate: 0,
            avgScore: 0,
            passAt1: 0,
            passAt3: 0,
            passAt5: 0,
            passPower3: 0,
        };
    }

    const passRates: number[] = runs.map(r => r.passed ? 1 : 0);
    const scores = runs.map(r => r.score);

    return {
        totalRuns: runs.length,
        passedRuns: passRates.filter(p => p === 1).length,
        passRate: passRates.reduce((a, b) => a + b, 0) / runs.length,
        avgScore: scores.reduce((a, b) => a + b, 0) / runs.length,
        passAt1: calculatePassAtK(passRates, 1),
        passAt3: calculatePassAtK(passRates, 3),
        passAt5: calculatePassAtK(passRates, 5),
        passPower3: calculatePassPowerK(passRates, 3),
    };
}

/**
 * Grade with mock data for testing
 */
export function gradeMock(run: Run): CompositeGradeResult {
    const codeGrade: CodeGradeResult = {
        score: 70 + Math.floor(Math.random() * 30),
        passed: Math.random() > 0.2,
        details: {
            checkpointsPassed: 3,
            checkpointsTotal: 4,
            intentAccuracy: 0.85 + Math.random() * 0.15,
            latencyPassed: true,
            issues: [],
        },
    };

    const modelGrade = generateMockModelGrade();

    const score = codeGrade.score * 0.6 + modelGrade.score * 0.4;

    return {
        score: Math.round(score),
        passed: codeGrade.passed && modelGrade.passed,
        codeGrade,
        modelGrade,
        weights: { code: 0.6, model: 0.4 },
    };
}
