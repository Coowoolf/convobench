import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { runs, transcripts, type NewRun } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// GET /api/runs - List all runs (with optional taskId filter)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const taskId = searchParams.get('taskId');

        let query = db.select().from(runs).orderBy(desc(runs.startTime));

        if (taskId) {
            query = query.where(eq(runs.taskId, taskId)) as typeof query;
        }

        const allRuns = await query;
        return NextResponse.json(allRuns);
    } catch (error) {
        console.error('Error fetching runs:', error);
        return NextResponse.json({ error: 'Failed to fetch runs' }, { status: 500 });
    }
}

// POST /api/runs - Create a new run
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const now = new Date();

        const newRun: NewRun = {
            id: randomUUID(),
            taskId: body.taskId,
            suiteId: body.suiteId || null,
            status: 'pending',
            startTime: now,
        };

        await db.insert(runs).values(newRun);
        return NextResponse.json(newRun, { status: 201 });
    } catch (error) {
        console.error('Error creating run:', error);
        return NextResponse.json({ error: 'Failed to create run' }, { status: 500 });
    }
}

// GET /api/runs/:id/transcripts - Get transcripts for a run
export async function getTranscripts(runId: string) {
    return db.select().from(transcripts).where(eq(transcripts.runId, runId));
}
