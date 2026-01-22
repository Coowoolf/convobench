'use client';

import React, { useState, useEffect } from 'react';
import { Search, Calendar, ExternalLink, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Discovery {
    id: string;
    title: string;
    authors: string;
    abstract: string;
    arxivId: string;
    discoveredAt: string;
    reviewed: boolean;
}

export default function DiscoveryPage() {
    const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/data/discoveries.json')
            .then(res => res.json())
            .then(data => {
                setDiscoveries(data.discoveries || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load discoveries:', err);
                setLoading(false);
            });
    }, []);

    const filteredDiscoveries = discoveries.filter(d =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.abstract.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
            {/* Header */}
            <header className="header">
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                        <div className="logo-icon">
                            <Sparkles style={{ width: 24, height: 24, color: 'white' }} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>PaperHunt</h1>
                            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>Discovery Feed</p>
                        </div>
                    </Link>
                    <Link href="/" className="btn btn-ghost">
                        ← Back to Main
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
                {/* Hero */}
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 100, background: 'var(--bg-elevated)', marginBottom: 16 }}>
                        <Sparkles style={{ width: 16, height: 16, color: 'var(--purple)' }} />
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--purple)' }}>New Discoveries</span>
                    </div>
                    <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 16 }}>
                        Latest <span className="gradient-text">Research</span>
                    </h1>
                    <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
                        Automatically discovered papers from arXiv, scanned daily for Voice Agent research
                    </p>
                </div>

                {/* Search */}
                <div style={{ marginBottom: 32 }}>
                    <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto' }}>
                        <Search style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, color: 'var(--text-tertiary)' }} />
                        <input
                            type="text"
                            placeholder="Search discoveries..."
                            className="input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: 52 }}
                        />
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 48 }}>
                    <div className="card" style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--purple)' }}>{discoveries.length}</div>
                        <div style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Total Discoveries</div>
                    </div>
                    <div className="card" style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--blue)' }}>{filteredDiscoveries.length}</div>
                        <div style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Filtered Results</div>
                    </div>
                </div>

                {/* Papers Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-tertiary)' }}>
                        Loading discoveries...
                    </div>
                ) : filteredDiscoveries.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-tertiary)' }}>
                        {searchQuery ? 'No discoveries match your search' : 'No discoveries yet. Check back soon!'}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
                        {filteredDiscoveries.map((paper) => (
                            <div key={paper.id} className="card card-highlight">
                                {/* Discovery Badge */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                                    <Sparkles style={{ width: 14, height: 14, color: 'var(--purple)' }} />
                                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        New Discovery
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, lineHeight: 1.4 }}>
                                    {paper.title}
                                </h3>

                                {/* Authors */}
                                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>
                                    {paper.authors}
                                </p>

                                {/* Abstract */}
                                <p style={{ fontSize: 14, color: 'var(--text-tertiary)', lineHeight: 1.6, marginBottom: 16 }}>
                                    {paper.abstract.slice(0, 200)}...
                                </p>

                                {/* Footer */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-tertiary)' }}>
                                        <Calendar style={{ width: 14, height: 14 }} />
                                        {new Date(paper.discoveredAt).toLocaleDateString()}
                                    </div>
                                    <a
                                        href={`https://arxiv.org/abs/${paper.arxivId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-ghost"
                                        style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                                    >
                                        arXiv
                                        <ExternalLink style={{ width: 14, height: 14 }} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
