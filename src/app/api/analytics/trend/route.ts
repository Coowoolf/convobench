import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { runs, tasks } from '@/db/schema';
import { gte, and, eq, sql } from 'drizzle-orm';

// GET /api/analytics/trend - Get pass rate trend by date
export async function GET() {
    try {
        // Get runs from the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Query runs with task type
        const recentRuns = await db
            .select({
                runId: runs.id,
                taskId: runs.taskId,
                status: runs.status,
                startTime: runs.startTime,
                taskCompletion: runs.taskCompletion,
            })
            .from(runs)
            .where(gte(runs.startTime, sevenDaysAgo));

        // Get task types
        const taskList = await db.select().from(tasks);
        const taskTypeMap = new Map(taskList.map(t => [t.id, t.type]));

        // Group by date
        const byDate = new Map<string, { capability: number[]; regression: number[] }>();

        for (const run of recentRuns) {
            const date = new Date(run.startTime).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
            if (!byDate.has(date)) {
                byDate.set(date, { capability: [], regression: [] });
            }

            const taskType = taskTypeMap.get(run.taskId) || 'capability';
            const passed = run.status === 'passed' ? 1 : 0;

            byDate.get(date)![taskType as 'capability' | 'regression'].push(passed);
        }

        // Calculate pass rates
        const trend = Array.from(byDate.entries())
            .map(([date, data]) => ({
                date,
                capability: data.capability.length > 0
                    ? Math.round(data.capability.reduce((a, b) => a + b, 0) / data.capability.length * 100)
                    : 0,
                regression: data.regression.length > 0
                    ? Math.round(data.regression.reduce((a, b) => a + b, 0) / data.regression.length * 100)
                    : 0,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return NextResponse.json(trend);
    } catch (error) {
        console.error('Error fetching trend:', error);
        return NextResponse.json({ error: 'Failed to fetch trend' }, { status: 500 });
    }
}
