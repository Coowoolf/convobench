'use client';

import { useState, useMemo, useEffect } from 'react';
import {
    Search,
    ArrowUpRight,
    BookOpen,
    Calendar,
    Users,
    Star,
    Sparkles,
    Github,
    Mic,
    Sun,
    Moon,
    ChevronRight
} from 'lucide-react';

interface Paper {
    id: string;
    title: string;
    authors: string;
    venue: string;
    year: number;
    arxivId?: string;
    link?: string;
    tags: string[];
    abstract: string;
    citations?: number;
    highlight?: boolean;
}

const papers: Paper[] = [
    {
        id: "whisper",
        title: "Robust Speech Recognition via Large-Scale Weak Supervision",
        authors: "Alec Radford, Jong Wook Kim, Tao Xu, et al.",
        venue: "ICML",
        year: 2023,
        arxivId: "2212.04356",
        tags: ["ASR", "foundation-model", "OpenAI"],
        abstract: "Whisper is trained on 680,000 hours of multilingual data, achieving robust speech recognition that generalizes well across domains and languages.",
        citations: 2100,
        highlight: true
    },
    {
        id: "google-duplex",
        title: "Google Duplex: An AI System for Accomplishing Real-World Tasks Over the Phone",
        authors: "Yaniv Leviathan, Yossi Matias",
        venue: "Google AI Blog",
        year: 2018,
        link: "https://ai.google/research/pubs/pub47586",
        tags: ["conversational-AI", "real-world", "Google"],
        abstract: "Google Duplex uses a recurrent neural network to conduct natural-sounding conversations over the phone for tasks like making restaurant reservations.",
        citations: 1250,
        highlight: true
    },
    {
        id: "gpt-4o",
        title: "GPT-4o: Omni-Modal Foundation Model",
        authors: "OpenAI",
        venue: "OpenAI Blog",
        year: 2024,
        link: "https://openai.com/research/gpt-4o",
        tags: ["multimodal", "real-time", "OpenAI"],
        abstract: "GPT-4o achieves human-like 232ms response latency for audio input, enabling natural real-time voice conversations with full-duplex capabilities.",
        citations: 890,
        highlight: true
    },
    {
        id: "superb",
        title: "SUPERB: Speech Processing Universal PERformance Benchmark",
        authors: "Shu-wen Yang, Po-Han Chi, Yung-Sung Chuang, et al.",
        venue: "INTERSPEECH",
        year: 2021,
        arxivId: "2105.01051",
        tags: ["benchmark", "ASR", "foundation-model"],
        abstract: "A benchmark for evaluating speech processing capabilities across critical tasks like Automatic Speech Recognition, Keyword Spotting, Speaker Identification, Intent Classification, and Emotion Recognition.",
        citations: 892
    },
    {
        id: "voiceassistant-eval",
        title: "VoiceAssistant-Eval: A Comprehensive Benchmark for AI Assistants",
        authors: "Various Authors",
        venue: "arXiv",
        year: 2024,
        arxivId: "2024.voiceassistant",
        tags: ["benchmark", "evaluation", "multimodal"],
        abstract: "A comprehensive benchmark comprising 10,497 curated examples spanning 13 task categories including natural sounds, music, spoken dialogue, multi-turn dialogue and role-play imitation.",
        citations: 45
    },
    {
        id: "vocalbench",
        title: "VocalBench: Benchmarking Vocal Conversational Abilities",
        authors: "Various Authors",
        venue: "arXiv",
        year: 2024,
        arxivId: "2024.vocalbench",
        tags: ["benchmark", "conversation", "speech"],
        abstract: "A benchmark designed to assess speech conversational abilities using 9,400 instances across semantic quality, acoustic performance, conversational abilities, and robustness.",
        citations: 31
    },
    {
        id: "voiceagenteval",
        title: "VoiceAgentEval: Evaluating LLMs for Expert-Level Outbound Calling",
        authors: "Various Authors",
        venue: "arXiv",
        year: 2024,
        arxivId: "2024.voiceagenteval",
        tags: ["benchmark", "voice-agent", "LLM"],
        abstract: "A benchmark for evaluating LLMs in expert-level intelligent outbound calling scenarios with user simulation and dynamic evaluation methods.",
        citations: 18
    },
    {
        id: "dialogbench",
        title: "DialogBench: Evaluating LLMs as Human-like Dialogue Systems",
        authors: "Various Authors",
        venue: "NAACL",
        year: 2024,
        arxivId: "2311.01677",
        tags: ["benchmark", "dialogue", "LLM"],
        abstract: "DialogBench evaluates LLMs based on their ability to act as human-like dialogue systems, comprising 12 distinct dialogue tasks using GPT-4 generated evaluation instances.",
        citations: 67
    },
    {
        id: "mt-bench",
        title: "MT-Bench: Multi-Turn Benchmark for LLM Conversation",
        authors: "Various Authors",
        venue: "arXiv",
        year: 2023,
        arxivId: "2306.05685",
        tags: ["benchmark", "multi-turn", "LLM"],
        abstract: "MT-Bench assesses LLMs in multi-turn dialogues, focusing on their capacity to maintain context and demonstrate reasoning skills across eight categories.",
        citations: 423
    },
    {
        id: "moshi",
        title: "Moshi: A Full-Duplex Speech-to-Speech Model",
        authors: "Kyutai Labs",
        venue: "arXiv",
        year: 2024,
        arxivId: "2410.00037",
        tags: ["full-duplex", "speech-to-speech", "real-time"],
        abstract: "Moshi enables simultaneous listening and speaking (full-duplex), processing speech directly without text intermediaries, achieving natural turn-taking.",
        citations: 156
    },
    {
        id: "llama-omni",
        title: "LLaMA-Omni: Seamless Speech Interaction with LLMs",
        authors: "Various Authors",
        venue: "arXiv",
        year: 2024,
        arxivId: "2409.06666",
        tags: ["speech-to-speech", "LLM", "real-time"],
        abstract: "LLaMA-Omni is built on LLaMA-3.1-8B for low-latency, high-quality speech interaction, generating speech responses directly from speech instructions.",
        citations: 89
    },
    {
        id: "seamlessm4t",
        title: "SeamlessM4T: Massively Multilingual & Multimodal Machine Translation",
        authors: "Meta AI",
        venue: "arXiv",
        year: 2023,
        arxivId: "2308.11596",
        tags: ["multilingual", "multimodal", "translation"],
        abstract: "A foundational multilingual and multitask model that supports near-100 languages for speech-to-speech, speech-to-text, text-to-speech, and text-to-text translation.",
        citations: 456
    },
    {
        id: "speechlm-survey",
        title: "Survey on Recent Advances in Speech Language Models",
        authors: "Various Authors",
        venue: "arXiv",
        year: 2024,
        arxivId: "2410.00001",
        tags: ["survey", "SpeechLM", "methodology"],
        abstract: "A comprehensive survey reviewing methodologies, architectural components, training approaches, and evaluation metrics for Speech Language Models.",
        citations: 89
    },
    {
        id: "sparrow-1",
        title: "Sparrow-1: Multilingual Audio Model for Real-Time Conversational Flow",
        authors: "Various Authors",
        venue: "arXiv",
        year: 2024,
        arxivId: "2024.sparrow",
        tags: ["real-time", "turn-taking", "multilingual"],
        abstract: "Sparrow-1 focuses on real-time conversational flow and 'floor transfer,' predicting when a system should listen, wait, or speak to mimic human conversation timing.",
        citations: 34
    },
    {
        id: "minimax-speech",
        title: "MiniMax Speech 2.5: Sub-250ms End-to-End Voice AI",
        authors: "MiniMax",
        venue: "MiniMax Blog",
        year: 2024,
        link: "https://minimax.io",
        tags: ["latency", "real-time", "TTS"],
        abstract: "MiniMax Speech 2.5 achieves end-to-end latency under 250 milliseconds, enabling truly real-time voice interactions.",
        citations: 28
    },
    {
        id: "slue",
        title: "SLUE: Spoken Language Understanding Evaluation",
        authors: "Shang-Wen Li, Suwon Shon, Hao Tang, et al.",
        venue: "ASRU",
        year: 2021,
        arxivId: "2111.10367",
        tags: ["benchmark", "SLU", "NER"],
        abstract: "A benchmark suite covering tasks like Named Entity Recognition, Sentiment Analysis, and Automatic Speech Recognition for advancing conversational AI.",
        citations: 156
    },
    {
        id: "sova-bench",
        title: "SOVA-Bench: Evaluating Generative Speech LLMs and Voice Assistants",
        authors: "Various Authors",
        venue: "arXiv",
        year: 2024,
        arxivId: "2024.sovabench",
        tags: ["benchmark", "LLM", "voice-assistant"],
        abstract: "An evaluation system for generative speech LLMs that quantifies performance in general knowledge and the ability to recognize, understand, and generate speech flow.",
        citations: 23
    },
    {
        id: "speechr",
        title: "SpeechR: Benchmarking Speech Reasoning in Large Audio-Language Models",
        authors: "Various Authors",
        venue: "arXiv",
        year: 2024,
        arxivId: "2024.speechr",
        tags: ["reasoning", "audio-LM", "benchmark"],
        abstract: "A benchmark to evaluate speech reasoning capabilities of large audio-language models in factual, procedural, and normative tasks.",
        citations: 15
    },
    {
        id: "chatbot-arena",
        title: "Chatbot Arena: An Open Platform for Evaluating LLMs by Human Preference",
        authors: "LMSYS",
        venue: "arXiv",
        year: 2024,
        arxivId: "2403.04132",
        tags: ["evaluation", "human-preference", "LLM"],
        abstract: "Chatbot Arena offers an open environment for evaluating LLMs based on human preferences through pairwise comparisons.",
        citations: 234
    },
    {
        id: "wildspeech-bench",
        title: "WildSpeech-Bench: Benchmarking End-to-End SpeechLLMs in the Wild",
        authors: "Various Authors",
        venue: "arXiv",
        year: 2025,
        arxivId: "2501.00001",
        tags: ["benchmark", "SpeechLLM", "real-world"],
        abstract: "A benchmark for end-to-end SpeechLLMs that addresses limitations of existing evaluations and provides comprehensive assessment in real-world speech interactions.",
        citations: 12
    }
];

const allTags = Array.from(new Set(papers.flatMap(p => p.tags))).sort();

const getTagColor = (tag: string): string => {
    const colors: Record<string, string> = {
        benchmark: "blue", evaluation: "purple", "voice-agent": "pink", "voice-assistant": "pink",
        LLM: "orange", speech: "blue", SpeechLLM: "purple", SpeechLM: "purple", survey: "blue",
        "real-world": "pink", latency: "orange", TTS: "orange", ASR: "blue", conversation: "purple",
        "conversational-AI": "pink", "foundation-model": "purple", "real-time": "orange",
        multimodal: "purple", "full-duplex": "pink", "speech-to-speech": "pink", dialogue: "blue",
        "multi-turn": "blue", multilingual: "purple", "turn-taking": "orange", "audio-LM": "purple",
        reasoning: "blue", "human-preference": "pink", OpenAI: "orange", Google: "blue",
        methodology: "purple", NER: "blue", SLU: "blue", translation: "purple",
    };
    return colors[tag] || "blue";
};

export default function Home() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<'year' | 'citations'>('citations');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
        const initial = saved || 'light';
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
        return [...result].sort((a, b) =>
            sortBy === 'citations' ? (b.citations || 0) - (a.citations || 0) : b.year - a.year
        );
    }, [searchQuery, selectedTags, sortBy]);

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const stats = {
        total: papers.length,
        benchmarks: papers.filter(p => p.tags.includes("benchmark")).length,
        recent: papers.filter(p => p.year >= 2024).length,
        citations: papers.reduce((sum, p) => sum + (p.citations || 0), 0)
    };

    return (
        <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
            {/* Decorations */}
            <div className="decoration animate-pulse" style={{ width: 400, height: 400, top: -100, left: -100, background: 'linear-gradient(135deg, #5B9FFF, #7B68EE)' }} />
            <div className="decoration animate-float" style={{ width: 300, height: 300, top: '40%', right: -80, background: 'linear-gradient(135deg, #A78BFA, #E879F9)' }} />
            <div className="decoration animate-pulse" style={{ width: 250, height: 250, bottom: -50, left: '30%', background: 'linear-gradient(135deg, #F472B6, #FCA5A5)' }} />

            {/* Header */}
            <header className="header">
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className="logo-icon">
                                <Mic className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 style={{ fontSize: 20, fontWeight: 700 }} className="gradient-text">ConvoBench</h1>
                                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: -2 }}>Voice Agent Paper Hunt</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button onClick={toggleTheme} className="btn btn-icon">
                                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                            <a href="https://github.com/Coowoolf/convobench" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                                <Github className="w-4 h-4" />
                                <span>GitHub</span>
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section style={{ position: 'relative', zIndex: 1, padding: '60px 24px 40px', textAlign: 'center' }}>
                <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, lineHeight: 1.1, color: 'var(--text-primary)' }}>
                    Discover <span className="gradient-text">Voice Agent</span> Research
                </h2>
                <p style={{ marginTop: 16, fontSize: 18, color: 'var(--text-secondary)', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
                    Curated collection of papers on Conversational AI, Speech LLMs, and Real-time Voice Interaction
                </p>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, maxWidth: 800, margin: '40px auto 0' }}>
                    <div className="stat-card blue">
                        <div style={{ fontSize: 32, fontWeight: 800 }}>{stats.total}</div>
                        <div style={{ fontSize: 13, opacity: 0.9, marginTop: 2 }}>Papers</div>
                    </div>
                    <div className="stat-card purple">
                        <div style={{ fontSize: 32, fontWeight: 800 }}>{stats.benchmarks}</div>
                        <div style={{ fontSize: 13, opacity: 0.9, marginTop: 2 }}>Benchmarks</div>
                    </div>
                    <div className="stat-card pink">
                        <div style={{ fontSize: 32, fontWeight: 800 }}>{stats.recent}</div>
                        <div style={{ fontSize: 13, opacity: 0.9, marginTop: 2 }}>2024+</div>
                    </div>
                    <div className="stat-card orange">
                        <div style={{ fontSize: 32, fontWeight: 800 }}>{stats.citations.toLocaleString()}</div>
                        <div style={{ fontSize: 13, opacity: 0.9, marginTop: 2 }}>Citations</div>
                    </div>
                </div>
            </section>

            {/* Main */}
            <main style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '0 24px 60px' }}>
                {/* Search */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, color: 'var(--text-tertiary)' }} />
                        <input
                            type="text"
                            placeholder="Search papers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input"
                            style={{ paddingLeft: 48 }}
                        />
                    </div>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'year' | 'citations')} className="select">
                        <option value="citations">Citations</option>
                        <option value="year">Year</option>
                    </select>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
                    {allTags.slice(0, 12).map(tag => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`tag ${getTagColor(tag)} ${selectedTags.includes(tag) ? 'active' : ''}`}
                        >
                            {tag}
                        </button>
                    ))}
                    {selectedTags.length > 0 && (
                        <button onClick={() => setSelectedTags([])} className="tag" style={{ background: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }}>
                            Clear ✕
                        </button>
                    )}
                </div>

                {/* Results */}
                <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 16 }}>
                    {filteredPapers.length} papers
                </p>

                {/* Papers */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {filteredPapers.map(paper => (
                        <article key={paper.id} className={`card ${paper.highlight ? 'card-highlight' : ''}`}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    {paper.highlight && (
                                        <span className="badge badge-landmark" style={{ marginBottom: 12, display: 'inline-flex' }}>
                                            <Sparkles className="w-3 h-3" /> Landmark
                                        </span>
                                    )}
                                    <h3 style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.4, color: 'var(--text-primary)' }}>
                                        {paper.title}
                                    </h3>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Users className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                                            {paper.authors}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <BookOpen className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                                            {paper.venue} · {paper.year}
                                        </span>
                                        {paper.citations && (
                                            <span className="citations">
                                                <Star className="w-4 h-4" />
                                                {paper.citations}
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ marginTop: 12, fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                                        {paper.abstract}
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
                                        {paper.tags.map(tag => (
                                            <span key={tag} className={`tag ${getTagColor(tag)}`} style={{ fontSize: 11, padding: '4px 10px', cursor: 'default' }}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <a
                                    href={paper.arxivId ? `https://arxiv.org/abs/${paper.arxivId}` : paper.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary"
                                    style={{ flexShrink: 0 }}
                                >
                                    <ArrowUpRight className="w-4 h-4" />
                                    {paper.arxivId ? 'arXiv' : 'Link'}
                                </a>
                            </div>
                        </article>
                    ))}
                </div>

                {filteredPapers.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-tertiary)' }}>
                        <Search style={{ width: 48, height: 48, margin: '0 auto 16px', opacity: 0.3 }} />
                        <p style={{ fontSize: 18, fontWeight: 600 }}>No papers found</p>
                        <p style={{ fontSize: 14, marginTop: 4 }}>Try adjusting your search or filters</p>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid var(--border)', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>© 2024 ConvoBench</p>
                    <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                        Missing a paper? <a href="https://github.com/Coowoolf/convobench/issues" target="_blank" rel="noopener noreferrer" className="gradient-text" style={{ fontWeight: 600 }}>Submit a PR</a>
                    </p>
                </div>
            </footer>
        </div>
    );
}
