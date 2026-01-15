import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { suites, type NewSuite } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// GET /api/suites - List all suites
export async function GET() {
    try {
        const allSuites = await db.select().from(suites);
        return NextResponse.json(allSuites);
    } catch (error) {
        console.error('Error fetching suites:', error);
        return NextResponse.json({ error: 'Failed to fetch suites' }, { status: 500 });
    }
}

// POST /api/suites - Create a new suite
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const now = new Date();

        const newSuite: NewSuite = {
            id: randomUUID(),
            name: body.name,
            description: body.description || '',
            taskIds: body.taskIds || [],
            createdAt: now,
            updatedAt: now,
        };

        await db.insert(suites).values(newSuite);
        return NextResponse.json(newSuite, { status: 201 });
    } catch (error) {
        console.error('Error creating suite:', error);
        return NextResponse.json({ error: 'Failed to create suite' }, { status: 500 });
    }
}

// DELETE /api/suites?id=xxx - Delete a suite
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Suite ID required' }, { status: 400 });
        }

        await db.delete(suites).where(eq(suites.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting suite:', error);
        return NextResponse.json({ error: 'Failed to delete suite' }, { status: 500 });
    }
}
