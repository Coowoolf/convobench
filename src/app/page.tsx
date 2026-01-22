'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
    Search, ArrowUpRight, BookOpen, Users, Star, Sparkles, Github, Sun, Moon,
    Zap, Clock, Brain, TrendingUp, Lightbulb, Mic, MessageSquare, Layers,
    Activity, Timer, Volume2, ChevronDown, ChevronRight, History
} from 'lucide-react';

import { papers, type Paper } from '@/data/papers';

// ==========================================
// Experience Gaps Data
// ==========================================
const experienceGaps = [
    { icon: Timer, title: "Turn-Taking Gap", target: "< 500ms", color: "amber", description: "Agent takes 1-3s to respond after user finishes, breaking conversational flow", solution: "End-to-End Models" },
    { icon: MessageSquare, title: "Barge-In", target: "Duplex Stream", color: "cyan", description: "Traditional systems cannot 'hear' user interruptions while speaking", solution: "Full-Duplex Architecture" },
    { icon: Volume2, title: "Prosody & Affect", target: "Audio Tokens", color: "pink", description: "Text intermediate layer loses tone, emotion, and laughter, making interactions feel soulless", solution: "Speech-Native Models" },
    { icon: Layers, title: "Context & Memory", target: "Agent System", color: "emerald", description: "Single models cannot handle complex tasks requiring tool calls, long-term memory, and safety policies", solution: "Orchestration Layer" },
];

// ==========================================
// Timeline Eras
// ==========================================
const timelineEras = [
    { id: "genesis", name: "Genesis Era", range: "1950-1980", color: "slate", summary: "Symbolic AI & Rule-based Systems", events: ["1950: Turing Test proposed", "1966: ELIZA chatbot", "1974: Turn-Taking systematics"] },
    { id: "statistical", name: "Statistical Era", range: "1980-2010", color: "amber", summary: "Probabilistic Modeling (HMM/N-Gram)", events: ["1989: HMM Tutorial", "1990s: POMDPs for dialogue"] },
    { id: "deep", name: "Deep Learning Era", range: "2010-2020", color: "cyan", summary: "End-to-End Representation Learning", events: ["2011: Siri launches", "2014: Seq2Seq", "2017: Transformer", "2018: Google Duplex"] },
    { id: "generative", name: "Generative Era", range: "2020-2026", color: "purple", summary: "LLMs & Real-time Duplex", events: ["2020: GPT-3", "2022: ChatGPT/RLHF", "2024: GPT-4o Native Audio", "2024: Moshi Full-Duplex"] },
];

// ==========================================
// Insights Data (from research)
// ==========================================
const insights = [
    { icon: Clock, title: "~200ms", subtitle: "Human Turn Gap", description: "Human conversation gaps are ~200ms, GPT-4o achieves 320ms", color: "blue" },
    { icon: TrendingUp, title: "75+ Years", subtitle: "Research History", description: "From 1950 Turing Test to 2026 Full-Duplex Interaction", color: "purple" },
    { icon: Zap, title: "Full-Duplex", subtitle: "Target Architecture", description: "Simultaneous listening and speaking, Moshi/GPT-4o breakthroughs", color: "pink" },
    { icon: Brain, title: "5.1% WER", subtitle: "Human Parity", description: "Microsoft Switchboard reached human parity in 2017", color: "orange" },
];

const allTags = Array.from(new Set(papers.flatMap(p => p.tags))).sort();

const getTagColor = (tag: string): string => {
    const colors: Record<string, string> = {
        benchmark: "blue", evaluation: "purple", foundational: "orange", landmark: "orange",
        LLM: "orange", speech: "blue", "full-duplex": "pink", "speech-to-speech": "pink",
        multimodal: "purple", transformer: "blue", attention: "blue", RLHF: "pink",
        OpenAI: "orange", Google: "blue", Meta: "blue", Alibaba: "blue",
        HMM: "slate", statistical: "slate", chatbot: "purple", "turn-taking": "amber",
        ASR: "cyan", "audio-LM": "purple", agents: "pink", simulation: "purple",
        omni: "pink", "real-time": "orange", "barge-in": "cyan", LSLM: "cyan",
        "speech-native": "pink", Chinese: "blue", "end-to-end": "orange",
        psychology: "slate", HCI: "slate", CASA: "slate", disfluency: "amber",
        textless: "purple", "speech-tokens": "cyan", alignment: "pink",
        "foundation-model": "purple", "open-source": "emerald", philosophy: "slate",
        sociology: "slate", "pattern-matching": "slate", "encoder-decoder": "blue",
        seq2seq: "blue", SSA: "purple", memory: "emerald", hearing: "purple"
    };
    return colors[tag] || "blue";
};

import VisualPipeline from '@/components/VisualPipeline';
import ResearchTimeline from '@/components/ResearchTimeline';
import FirstPrinciples from '@/components/FirstPrinciples';

export default function Home() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedEra, setSelectedEra] = useState<string>('all');
    const [activeTier, setActiveTier] = useState<string | null>(null); // New Tier State
    const [sortBy, setSortBy] = useState<'year' | 'citations'>('citations');
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [activeSection, setActiveSection] = useState<string>('insights');

    useEffect(() => {
        const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
        const initial = saved || 'dark';
        setTheme(initial);
        document.documentElement.setAttribute('data-theme', initial);
    }, []);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    };

    const filteredPapers = useMemo(() => {
        let result = papers;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.title.toLowerCase().includes(q) ||
                p.authors.toLowerCase().includes(q) ||
                p.abstract.toLowerCase().includes(q) ||
                p.tags.some(t => t.toLowerCase().includes(q))
            );
        }
        if (selectedTags.length > 0) {
            result = result.filter(p => selectedTags.some(tag => p.tags.includes(tag)));
        }
        if (selectedEra !== 'all') {
            result = result.filter(p => p.era === selectedEra);
        }
        if (activeTier) {
            result = result.filter(p => p.tier === activeTier);
        }
        return [...result].sort((a, b) =>
            sortBy === 'citations' ? (b.citations || 0) - (a.citations || 0) : b.year - a.year
        );
    }, [searchQuery, selectedTags, selectedEra, activeTier, sortBy]);

    const handleTierClick = (tier: string) => {
        setActiveTier(prev => prev === tier ? null : tier);
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const stats = {
        total: papers.length,
        landmarks: papers.filter(p => p.highlight).length,
        eras: 4,
        citations: papers.reduce((sum, p) => sum + (p.citations || 0), 0)
    };

    return (
        <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
            {/* Background Decorations */}
            <div className="decoration animate-pulse" style={{ width: 500, height: 500, top: -150, left: -150, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }} />
            <div className="decoration animate-float" style={{ width: 400, height: 400, top: '30%', right: -100, background: 'linear-gradient(135deg, #8b5cf6, #d946ef)' }} />
            <div className="decoration animate-pulse" style={{ width: 300, height: 300, bottom: -80, left: '40%', background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }} />

            {/* Header */}
            <header className="header">
                <div style={{ maxWidth: 1400, margin: '0 auto', padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Image src="/logo.jpg" alt="PaperHunt Logo" width={48} height={48} style={{ borderRadius: 12 }} />
                            <div>
                                <h1 style={{ fontSize: 20, fontWeight: 700 }} className="gradient-text">PaperHunt</h1>
                                <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: -2 }}>Conversational AI Research Hub</p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav style={{ display: 'flex', gap: 4, background: 'var(--bg-elevated)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' }}>
                            {['principles', 'insights', 'gaps', 'timeline', 'papers'].map(section => (
                                <button key={section} onClick={() => setActiveSection(section)}
                                    style={{
                                        padding: '6px 14px', fontSize: 12, fontWeight: 500, borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                        background: activeSection === section ? 'var(--blue)' : 'transparent',
                                        color: activeSection === section ? 'white' : 'var(--text-secondary)'
                                    }}>
                                    {section.charAt(0).toUpperCase() + section.slice(1)}
                                </button>
                            ))}
                        </nav>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button onClick={toggleTheme} className="btn btn-icon">
                                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                            <a href="/discovery" className="btn btn-ghost">
                                <Sparkles className="w-4 h-4" /><span>Discovery</span>
                            </a>
                            <a href="https://github.com/Coowoolf/paperhunt" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                                <Github className="w-4 h-4" /><span>GitHub</span>
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section style={{ position: 'relative', zIndex: 1, padding: '50px 24px 30px', textAlign: 'center' }}>
                <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, lineHeight: 1.15, color: 'var(--text-primary)' }}>
                    Conversational AI<br />
                    <span className="gradient-text">Research & Implementation</span>
                </h2>
                <p style={{ marginTop: 16, fontSize: 16, color: 'var(--text-secondary)', maxWidth: 650, marginLeft: 'auto', marginRight: 'auto' }}>
                    From 1950 Turing Test to 2026 Full-Duplex Real-Time Interaction<br />
                    Analyzing the core gaps, architectural evolution, and key literature in Human-Agent Interaction
                </p>

                {/* Hero Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, maxWidth: 800, margin: '40px auto 0' }}>
                    <div className="stat-card blue">
                        <div style={{ fontSize: 28, fontWeight: 800 }}>{stats.total}+</div>
                        <div style={{ fontSize: 11, opacity: 0.9 }}>Papers</div>
                    </div>
                    <div className="stat-card purple">
                        <div style={{ fontSize: 28, fontWeight: 800 }}>75 Years</div>
                        <div style={{ fontSize: 11, opacity: 0.9 }}>Research</div>
                    </div>
                    <div className="stat-card pink">
                        <div style={{ fontSize: 28, fontWeight: 800 }}>~200ms</div>
                        <div style={{ fontSize: 11, opacity: 0.9 }}>Human Gap</div>
                    </div>
                    <div className="stat-card orange">
                        <div style={{ fontSize: 28, fontWeight: 800 }}>Duplex</div>
                        <div style={{ fontSize: 11, opacity: 0.9 }}>Target</div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main style={{ position: 'relative', zIndex: 1, maxWidth: 1400, margin: '0 auto', padding: '0 24px 60px' }}>

                {/* Section: First Principles */}
                {activeSection === 'principles' && (
                    <FirstPrinciples onPrincipleClick={(tag) => {
                        setSelectedTags([tag]);
                        setActiveSection('papers');
                    }} />
                )}

                {/* Section: Insights */}
                {activeSection === 'insights' && (
                    <section className="fade-in" style={{ marginBottom: 40 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                            <Activity style={{ width: 24, height: 24, color: 'var(--cyan)' }} />
                            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Core Metrics Dashboard</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                            {insights.map((insight, i) => (
                                <div key={i} className="card" style={{ textAlign: 'center', padding: 24 }}>
                                    <div style={{ width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `var(--gradient-${insight.color})` }}>
                                        <insight.icon style={{ width: 28, height: 28, color: 'white' }} />
                                    </div>
                                    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{insight.title}</div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: `var(--${insight.color})`, marginTop: 4 }}>{insight.subtitle}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 10 }}>{insight.description}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Section: Experience Gaps */}
                {activeSection === 'gaps' && (
                    <section className="fade-in" style={{ marginBottom: 40 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                            <Zap style={{ width: 24, height: 24, color: 'var(--amber)' }} />
                            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>The Experience Gaps</h3>
                            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>Why typical bots feel robotic</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                            {experienceGaps.map((gap, i) => (
                                <div key={i} className="card hover-lift" style={{ padding: 24, borderLeft: `3px solid var(--${gap.color})` }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `var(--${gap.color})20` }}>
                                        <gap.icon style={{ width: 22, height: 22, color: `var(--${gap.color})` }} />
                                    </div>
                                    <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{gap.title}</h4>
                                    <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 12, lineHeight: 1.5 }}>{gap.description}</p>
                                    <div style={{ display: 'inline-block', fontSize: 10, fontFamily: 'monospace', padding: '4px 10px', borderRadius: 6, background: `var(--${gap.color})15`, color: `var(--${gap.color})`, border: `1px solid var(--${gap.color})30` }}>
                                        Target: {gap.target}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Architecture Comparison */}
                        <div style={{ marginTop: 40 }}>
                            <h4 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>Architecture Paradigm Shift</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                {/* Legacy Cascade */}
                                <div className="card" style={{ padding: 28, borderTop: '3px solid var(--text-tertiary)' }}>
                                    <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-tertiary)', marginBottom: 10 }}>LEGACY: CASCADE PIPELINE</div>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 24, textAlign: 'center' }}>High Latency (~2000ms)</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                                        {['Audio Input', 'ASR (Transcribe)', 'LLM (Text)', 'TTS (Synthesize)', 'Audio Output'].map((step, i) => (
                                            <div key={i}>
                                                <div style={{ padding: '12px 28px', borderRadius: 10, fontSize: 14, fontWeight: 500, background: i === 0 || i === 4 ? 'var(--bg-elevated)' : 'var(--blue)15', color: i === 0 || i === 4 ? 'var(--text-secondary)' : 'var(--blue)', border: `1px solid ${i === 0 || i === 4 ? 'var(--border)' : 'var(--blue)30'}` }}>
                                                    {step}
                                                </div>
                                                {i < 4 && <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 18, padding: '6px 0' }}>↓</div>}
                                            </div>
                                        ))}
                                    </div>
                                    <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-tertiary)' }}>⚠️ Lossy: Emotion lost in text • ⚠️ Slow: Serial processing</p>
                                </div>

                                {/* Target Omni-Duplex */}
                                <div className="card card-highlight" style={{ padding: 28, borderTop: '3px solid var(--cyan)' }}>
                                    <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--cyan)', marginBottom: 10 }}>TARGET: OMNI-DUPLEX</div>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--cyan)', marginBottom: 24, textAlign: 'center' }}>Real-Time (~300ms)</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                                        <div style={{ padding: '12px 28px', borderRadius: 10, fontSize: 14, fontWeight: 500, background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Input Stream</div>
                                        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 18 }}>↓</div>
                                        <div style={{ padding: 28, borderRadius: 16, border: '2px dashed var(--cyan)50', background: 'var(--cyan)05', textAlign: 'center' }}>
                                            <div style={{ fontSize: 28, marginBottom: 10 }}>👂 🧠 🎤</div>
                                            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Joint Audio/Text Model</div>
                                            <div style={{ fontSize: 13, color: 'var(--emerald)', marginTop: 6 }}>Listening while Speaking</div>
                                        </div>
                                        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 18 }}>↓</div>
                                        <div style={{ padding: '10px 24px', borderRadius: 8, fontSize: 13, background: 'var(--emerald)10', color: 'var(--emerald)', border: '1px solid var(--emerald)30', display: 'flex', gap: 20 }}>
                                            <span>Tools</span><span>Memory</span><span>Safety</span>
                                        </div>
                                        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 18 }}>↓</div>
                                        <div style={{ padding: '12px 28px', borderRadius: 10, fontSize: 14, fontWeight: 500, background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Output Stream</div>
                                    </div>
                                    <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-tertiary)' }}>✅ Lossless: Preserves emotion • ✅ Fast: Streaming tokens</p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Section: Timeline */}
                {activeSection === 'timeline' && (
                    <section className="fade-in" style={{ marginBottom: 40 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
                            <History style={{ width: 24, height: 24, color: 'var(--purple)' }} />
                            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Historical Timeline (1950-2026)</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                            {timelineEras.map((era, i) => (
                                <div key={era.id} className="card" style={{ padding: 24, borderTop: `3px solid var(--${era.color})` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: `var(--${era.color})` }} />
                                        <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{era.name}</h4>
                                    </div>
                                    <span style={{ fontSize: 11, fontFamily: 'monospace', padding: '2px 10px', borderRadius: 6, border: '1px solid var(--border)', color: 'var(--text-tertiary)', display: 'inline-block', marginBottom: 12 }}>{era.range}</span>
                                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 16 }}>{era.summary}</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {era.events.map((event, j) => (
                                            <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12 }}>
                                                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: `var(--${era.color})`, minWidth: 45, flexShrink: 0 }}>{event.split(':')[0]}</span>
                                                <span style={{ color: 'var(--text-tertiary)' }}>{event.split(':')[1]}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Section: Papers Repository */}
                {activeSection === 'papers' && (
                    <section className="fade-in">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                            <BookOpen style={{ width: 24, height: 24, color: 'var(--blue)' }} />
                            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Paper Repository</h3>
                            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-tertiary)' }}>{filteredPapers.length} papers</span>
                        </div>

                        {/* Visual Pipeline Filter */}
                        <VisualPipeline activeTier={activeTier || ''} onTierClick={handleTierClick} />

                        {/* Research Timeline */}
                        <ResearchTimeline papers={filteredPapers} />

                        {/* Search and Filters */}
                        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: 250, position: 'relative' }}>
                                <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: 'var(--text-tertiary)' }} />
                                <input type="text" placeholder="Search title, author, keyword..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input" style={{ paddingLeft: 44 }} />
                            </div>
                            <select value={selectedEra} onChange={(e) => setSelectedEra(e.target.value)} className="select">
                                <option value="all">All Eras</option>
                                <option value="Genesis">Genesis (1950-1980)</option>
                                <option value="Statistical">Statistical (1980-2010)</option>
                                <option value="Deep Learning">Deep Learning (2010-2020)</option>
                                <option value="Generative">Generative (2020+)</option>
                            </select>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'year' | 'citations')} className="select">
                                <option value="citations">By Citations</option>
                                <option value="year">By Year</option>
                            </select>
                        </div>

                        {/* Tags */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
                            {['landmark', 'full-duplex', 'transformer', 'RLHF', 'benchmark', 'ASR', 'multimodal', 'agents'].map(tag => (
                                <button key={tag} onClick={() => toggleTag(tag)} className={`tag ${getTagColor(tag)} ${selectedTags.includes(tag) ? 'active' : ''}`}>
                                    {tag}
                                </button>
                            ))}
                            {selectedTags.length > 0 && (
                                <button onClick={() => setSelectedTags([])} className="tag" style={{ background: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }}>Clear ✕</button>
                            )}
                        </div>

                        {/* Papers Grid */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {filteredPapers.map(paper => (
                                <article key={paper.id} className={`card ${paper.highlight ? 'card-highlight' : ''} ${paper.tier ? `tier-${paper.tier}` : ''}`}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                                <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{paper.year}</span>
                                                {paper.era && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }}>{paper.era}</span>}
                                                {paper.highlight && <span className="badge badge-landmark"><Sparkles className="w-3 h-3" /> Landmark</span>}
                                                {paper.mustRead && <span className="badge badge-must-read">MUST READ</span>}
                                            </div>
                                            <h4 style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4, color: 'var(--text-primary)', marginBottom: 6 }}>{paper.title}</h4>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
                                                <span><Users className="w-3 h-3" style={{ display: 'inline', marginRight: 4 }} />{paper.authors}</span>
                                                <span>{paper.venue}</span>
                                                {paper.citations && <span className="citations"><Star className="w-3 h-3" />{paper.citations >= 1000 ? `${(paper.citations / 1000).toFixed(0)}K` : paper.citations}</span>}
                                            </div>
                                            <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-tertiary)', marginBottom: 12 }}>{paper.abstract}</p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                                {paper.tags.map(tag => (
                                                    <span key={tag} className={`tag ${getTagColor(tag)}`} style={{ fontSize: 10, padding: '3px 8px' }}>{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <a href={paper.arxivId ? `https://arxiv.org/abs/${paper.arxivId}` : paper.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ flexShrink: 0 }}>
                                            <ArrowUpRight className="w-4 h-4" />{paper.arxivId ? 'arXiv' : 'Link'}
                                        </a>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {filteredPapers.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-tertiary)' }}>
                                <Search style={{ width: 48, height: 48, margin: '0 auto 16px', opacity: 0.3 }} />
                                <p style={{ fontSize: 18, fontWeight: 600 }}>No papers found</p>
                            </div>
                        )}
                    </section>
                )}
            </main>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid var(--border)', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>© 2026 PaperHunt • Conversational AI Research Hub</p>
                    <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                        Missing a paper? <a href="https://github.com/Coowoolf/paperhunt/issues" target="_blank" rel="noopener noreferrer" className="gradient-text" style={{ fontWeight: 600 }}>Submit a PR</a>
                    </p>
                </div>
            </footer>
        </div>
    );
}
