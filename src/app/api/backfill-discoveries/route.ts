import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Reuse keywords from paper-scan
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
    try {
        const allPapers: ArxivPaper[] = [];
        const startDate = '20240101'; // Jan 1, 2024
        const endDate = '20261231';   // Dec 31, 2026

        console.log(`Starting backfill for ${startDate} to ${endDate}...`);

        // Search each keyword
        for (const keyword of SEARCH_KEYWORDS) {
            console.log(`Searching: ${keyword}`);
            const papers = await searchArxivByDateRange(keyword, startDate, endDate, 30);
            allPapers.push(...papers);
            // Rate limit: 1 second between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Deduplicate by arxivId
        const uniquePapers = Array.from(
            new Map(allPapers.map(p => [p.arxivId, p])).values()
        );

        console.log(`Found ${uniquePapers.length} unique papers`);

        // Load existing main papers to exclude
        const mainPapersPath = path.join(process.cwd(), 'src', 'data', 'papers.ts');
        const mainPapersContent = await fs.readFile(mainPapersPath, 'utf-8');
        const mainArxivIds = new Set(
            Array.from(mainPapersContent.matchAll(/arxivId:\s*["']([^"']+)["']/g))
                .map(m => m[1])
        );

        // Load existing discoveries
        const discoveriesPath = path.join(process.cwd(), 'data', 'discoveries.json');
        let existingData: { discoveries: Discovery[], lastScan: string | null } = {
            discoveries: [],
            lastScan: null
        };

        try {
            const data = await fs.readFile(discoveriesPath, 'utf-8');
            existingData = JSON.parse(data);
        } catch {
            // File doesn't exist or is invalid, start fresh
        }

        const existingDiscoveryIds = new Set(existingData.discoveries.map(d => d.arxivId));

        // Filter out papers already in main collection or discoveries
        const newPapers = uniquePapers.filter(p =>
            !mainArxivIds.has(p.arxivId) && !existingDiscoveryIds.has(p.arxivId)
        );

        console.log(`New discoveries: ${newPapers.length}`);

        // Convert to discoveries format
        const newDiscoveries: Discovery[] = newPapers.map(paper => ({
            id: paper.arxivId,
            title: paper.title,
            authors: paper.authors,
            abstract: paper.summary,
            arxivId: paper.arxivId,
            discoveredAt: new Date().toISOString(),
            reviewed: false
        }));

        // Merge and save
        const updatedData = {
            discoveries: [...newDiscoveries, ...existingData.discoveries],
            lastScan: new Date().toISOString()
        };

        await fs.writeFile(discoveriesPath, JSON.stringify(updatedData, null, 2));

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            dateRange: { startDate, endDate },
            keywordsSearched: SEARCH_KEYWORDS.length,
            totalFound: uniquePapers.length,
            excludedFromMain: uniquePapers.length - newPapers.length,
            newDiscoveries: newPapers.length,
            sampleTitles: newDiscoveries.slice(0, 5).map(d => d.title)
        });

    } catch (error) {
        console.error('Backfill error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
