import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'redis';

const SEARCH_KEYWORDS = [
    // Core Voice Agent
    'voice agent', 'conversational AI', 'speech dialogue',
    'full-duplex speech', 'speech-to-speech', 'voice assistant LLM',
    // ASR/TTS Benchmarks
    'ASR benchmark', 'speech recognition evaluation',
    'TTS evaluation', 'speech synthesis quality',
    // Multimodal Audio
    'multimodal LLM audio', 'audio language model',
    'streaming speech generation', 'real-time voice interaction',
    // Specific Projects & Companies
    'PersonaPlex', 'NVIDIA voice', 'GPT-4o voice', 'Gemini voice',
    'voice cloning', 'speaker adaptation', 'zero-shot TTS',
    'end-to-end speech model', 'neural codec', 'audio codec'
];

interface ArxivPaper {
    id: string;
    title: string;
    authors: string;
    summary: string;
    published: string;
    arxivId: string;
}

interface Discovery {
    id: string;
    title: string;
    authors: string;
    abstract: string;
    arxivId: string;
    discoveredAt: string;
    reviewed: boolean;
}

function parseArxivResponse(xml: string): ArxivPaper[] {
    const papers: ArxivPaper[] = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;

    while ((match = entryRegex.exec(xml)) !== null) {
        const entry = match[1];
        const idMatch = entry.match(/<id>(.*?)<\/id>/);
        const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
        const summaryMatch = entry.match(/<summary>([\s\S]*?)<\/summary>/);
        const publishedMatch = entry.match(/<published>(.*?)<\/published>/);
        const authorMatches = entry.matchAll(/<name>(.*?)<\/name>/g);

        if (idMatch && titleMatch) {
            const arxivUrl = idMatch[1];
            const arxivId = arxivUrl.split('/abs/')[1];
            const authors = Array.from(authorMatches).map(m => m[1]).join(', ');

            papers.push({
                id: arxivId,
                title: titleMatch[1].replace(/\s+/g, ' ').trim(),
                authors,
                summary: summaryMatch ? summaryMatch[1].replace(/\s+/g, ' ').trim() : '',
                published: publishedMatch ? publishedMatch[1] : '',
                arxivId
            });
        }
    }
    return papers;
}

async function searchArxivByDateRange(
    query: string,
    startDate: string,
    endDate: string,
    maxResults: number = 50
): Promise<ArxivPaper[]> {
    const encodedQuery = encodeURIComponent(query);
    const url = `http://export.arxiv.org/api/query?search_query=all:${encodedQuery}+AND+submittedDate:[${startDate}+TO+${endDate}]&start=0&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`arXiv API error: ${response.status}`);
    }

    const xml = await response.text();
    return parseArxivResponse(xml);
}

export async function GET(request: NextRequest) {
    const redis = createClient({ url: process.env.REDIS_URL });

    try {
        await redis.connect();

        const allPapers: ArxivPaper[] = [];
        const startDate = '20240101';
        const endDate = '20261231';

        console.log(`Starting backfill for ${startDate} to ${endDate}...`);

        for (const keyword of SEARCH_KEYWORDS) {
            console.log(`Searching: ${keyword}`);
            const papers = await searchArxivByDateRange(keyword, startDate, endDate, 50);
            allPapers.push(...papers);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const uniquePapers = Array.from(
            new Map(allPapers.map(p => [p.arxivId, p])).values()
        );

        console.log(`Found ${uniquePapers.length} unique papers`);

        const existingData = await redis.get('discoveries');
        const existingDiscoveries: Discovery[] = existingData ? JSON.parse(existingData) : [];
        const existingDiscoveryIds = new Set(existingDiscoveries.map(d => d.arxivId));

        const newPapers = uniquePapers.filter(p => !existingDiscoveryIds.has(p.arxivId));

        console.log(`New discoveries: ${newPapers.length}`);

        const newDiscoveries: Discovery[] = newPapers.map(paper => ({
            id: paper.arxivId,
            title: paper.title,
            authors: paper.authors,
            abstract: paper.summary,
            arxivId: paper.arxivId,
            discoveredAt: new Date().toISOString(),
            reviewed: false
        }));

        const allDiscoveries = [...newDiscoveries, ...existingDiscoveries];
        await redis.set('discoveries', JSON.stringify(allDiscoveries));
        await redis.set('discoveries:lastScan', new Date().toISOString());

        await redis.disconnect();

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            dateRange: { startDate, endDate },
            keywordsSearched: SEARCH_KEYWORDS.length,
            totalFound: uniquePapers.length,
            newDiscoveries: newPapers.length,
            totalStored: allDiscoveries.length,
            sampleTitles: newDiscoveries.slice(0, 5).map(d => d.title)
        });

    } catch (error) {
        await redis.disconnect();
        console.error('Backfill error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
