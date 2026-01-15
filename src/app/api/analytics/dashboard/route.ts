import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { runs, tasks, suites } from '@/db/schema';
import { count, avg, eq } from 'drizzle-orm';

// GET /api/analytics/dashboard - Get dashboard metrics
export async function GET() {
    try {
        // Get totals
        const taskList = await db.select().from(tasks);
        const suiteList = await db.select().from(suites);
        const runList = await db.select().from(runs);

        const capabilityTasks = taskList.filter(t => t.type === 'capability');
        const regressionTasks = taskList.filter(t => t.type === 'regression');

        const passedRuns = runList.filter(r => r.status === 'passed');

        // Calculate averages
        const avgLatency = runList
            .filter(r => r.e2eLatency != null)
            .reduce((acc, r) => acc + (r.e2eLatency || 0), 0) / (runList.filter(r => r.e2eLatency != null).length || 1);

        const avgPassRate = runList.length > 0
            ? (passedRuns.length / runList.length) * 100
            : 0;

        // Calculate suite health
        const suiteHealth = suiteList.map(suite => {
            const suiteTaskIds = suite.taskIds || [];
            const suiteRuns = runList.filter(r => suiteTaskIds.includes(r.taskId));
            const suitePassed = suiteRuns.filter(r => r.status === 'passed');
            const passRate = suiteRuns.length > 0
                ? (suitePassed.length / suiteRuns.length) * 100
                : 0;

            let status: 'healthy' | 'warning' | 'saturated';
            if (passRate >= 95) status = 'saturated';
            else if (passRate >= 80) status = 'healthy';
            else status = 'warning';

            return {
                id: suite.id,
                name: suite.name,
                description: suite.description,
                taskCount: suiteTaskIds.length,
                passRate: Math.round(passRate),
                lastRun: suiteRuns.length > 0
                    ? new Date(Math.max(...suiteRuns.map(r => r.startTime.getTime()))).toLocaleString('zh-CN')
                    : 'N/A',
                status,
            };
        });

        return NextResponse.json({
            totalTasks: taskList.length,
            avgPassRate: Math.round(avgPassRate * 10) / 10,
            avgLatency: Math.round(avgLatency),
            totalRuns: runList.length,
            capabilityEvals: capabilityTasks.length,
            regressionEvals: regressionTasks.length,
            suites: suiteHealth,
        });
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 });
    }
}
