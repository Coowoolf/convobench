import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'redis';

const SEARCH_KEYWORDS = [
    'voice agent', 'conversational AI', 'speech dialogue',
    'full-duplex speech', 'speech-to-speech', 'voice assistant LLM',
    'ASR benchmark', 'speech recognition evaluation',
    'TTS evaluation', 'speech synthesis quality',
    'multimodal LLM audio', 'audio language model',
    'streaming speech generation', 'real-time voice interaction'
];

interface ArxivPaper {
    id: string;
    title: string;
    authors: string;
    summary: string;
    published: string;
    arxivId: string;
    link: string;
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
                arxivId,
                link: arxivUrl
            });
        }
    }
    return papers;
}

async function searchArxiv(query: string, maxResults: number = 10): Promise<ArxivPaper[]> {
    const encodedQuery = encodeURIComponent(query);
    const url = `http://export.arxiv.org/api/query?search_query=all:${encodedQuery}&start=0&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`arXiv API error: ${response.status}`);
    }

    const xml = await response.text();
    return parseArxivResponse(xml);
}

function filterRecentPapers(papers: ArxivPaper[], days: number = 7): ArxivPaper[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return papers.filter(paper => {
        const publishedDate = new Date(paper.published);
        return publishedDate >= cutoffDate;
    });
}

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const redis = createClient({ url: process.env.REDIS_URL });

    try {
        await redis.connect();

        const allPapers: ArxivPaper[] = [];

        for (const keyword of SEARCH_KEYWORDS) {
            const papers = await searchArxiv(keyword, 5);
            allPapers.push(...papers);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const uniquePapers = Array.from(
            new Map(allPapers.map(p => [p.arxivId, p])).values()
        );

        const recentPapers = filterRecentPapers(uniquePapers, 7);

        const existingData = await redis.get('discoveries');
        const existingDiscoveries: Discovery[] = existingData ? JSON.parse(existingData) : [];

        const existingIds = new Set(existingDiscoveries.map(d => d.arxivId));
        const newPapers = recentPapers.filter(p => !existingIds.has(p.arxivId));

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
            keywordsSearched: SEARCH_KEYWORDS.length,
            totalFound: uniquePapers.length,
            recentPapers: recentPapers.length,
            newDiscoveries: newDiscoveries.length,
            newPaperTitles: newDiscoveries.map(d => d.title)
        });

    } catch (error) {
        await redis.disconnect();
        console.error('Paper scan error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
