import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { tasks, type NewTask } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// GET /api/tasks - List all tasks
export async function GET() {
    try {
        const allTasks = await db.select().from(tasks);
        return NextResponse.json(allTasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const now = new Date();

        const newTask: NewTask = {
            id: randomUUID(),
            name: body.name,
            description: body.description || '',
            type: body.type || 'capability',
            category: body.category || 'general',
            systemPrompt: body.systemPrompt || null,
            checkpoints: body.checkpoints || [],
            createdAt: now,
            updatedAt: now,
        };

        await db.insert(tasks).values(newTask);
        return NextResponse.json(newTask, { status: 201 });
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}

// DELETE /api/tasks?id=xxx - Delete a task
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
        }

        await db.delete(tasks).where(eq(tasks.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}
