import { NextResponse } from 'next/server';
import { createClient } from 'redis';

interface Discovery {
    id: string;
    title: string;
    authors: string;
    abstract: string;
    arxivId: string;
    discoveredAt: string;
    reviewed: boolean;
}

export async function GET() {
    const redis = createClient({ url: process.env.REDIS_URL });

    try {
        await redis.connect();

        const discoveriesData = await redis.get('discoveries');
        const discoveries: Discovery[] = discoveriesData ? JSON.parse(discoveriesData) : [];
        const lastScan = await redis.get('discoveries:lastScan');

        await redis.disconnect();

        return NextResponse.json({
            discoveries,
            lastScan,
            total: discoveries.length
        });
    } catch (error) {
        await redis.disconnect();
        console.error('Error fetching discoveries:', error);
        return NextResponse.json({
            discoveries: [],
            lastScan: null,
            total: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
