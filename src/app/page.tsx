'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
    Search, ArrowUpRight, BookOpen, Users, Star, Sparkles, Github, Sun, Moon,
    Zap, Clock, Brain, TrendingUp, Lightbulb, Mic, MessageSquare, Layers,
    Activity, Timer, Volume2, ChevronDown, ChevronRight, History
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
    era?: string;
}

// ==========================================
// Comprehensive Paper Database
// ==========================================
const papers: Paper[] = [
    // Genesis Era (1950-1980)
    { id: "turing", title: "Computing Machinery and Intelligence", authors: "Alan Turing", venue: "Mind", year: 1950, link: "https://redirect.cs.umbc.edu/courses/471/papers/turing.pdf", tags: ["foundational", "philosophy", "landmark"], abstract: "The philosophical foundation of AI. Proposed the Turing Test - defining intelligence as the ability to imitate human conversation indistinguishably.", citations: 50000, highlight: true, era: "Genesis" },
    { id: "eliza", title: "ELIZA—A Computer Program for Natural Language Communication", authors: "Joseph Weizenbaum", venue: "CACM", year: 1966, link: "https://dl.acm.org/doi/10.1145/365153.365168", tags: ["chatbot", "pattern-matching", "landmark"], abstract: "First chatbot using pattern matching. Demonstrated the 'Eliza Effect' where users attribute intelligence to simple scripts.", citations: 8500, highlight: true, era: "Genesis" },
    { id: "turn-taking", title: "A Simplest Systematics for Turn-Taking in Conversation", authors: "Sacks, Schegloff, Jefferson", venue: "Language", year: 1974, link: "https://www.jstor.org/stable/412243", tags: ["turn-taking", "sociology", "foundational"], abstract: "Seminal sociology paper defining Transition Relevance Places (TRPs), essential for modern endpointing algorithms.", citations: 25000, highlight: true, era: "Genesis" },

    // Statistical Era (1980-2010)
    { id: "hmm-tutorial", title: "A Tutorial on HMMs and Applications in Speech Recognition", authors: "Lawrence Rabiner", venue: "IEEE", year: 1989, link: "https://ieeexplore.ieee.org/document/18626", tags: ["HMM", "ASR", "statistical"], abstract: "The bible of statistical speech recognition that dominated the field until Deep Learning took over in ~2010.", citations: 35000, era: "Statistical" },
    { id: "media-equation", title: "The Media Equation: How People Treat Computers Like Real People", authors: "Reeves & Nass", venue: "CSLI", year: 1996, link: "https://dl.acm.org/doi/10.5555/526012", tags: ["psychology", "HCI", "CASA"], abstract: "CASA Paradigm - proving humans subconsciously apply social rules (politeness, reciprocity) to computers.", citations: 8000, era: "Statistical" },

    // Deep Learning Era (2010-2020)
    { id: "seq2seq", title: "Sequence to Sequence Learning with Neural Networks", authors: "Sutskever, Vinyals, Le", venue: "NeurIPS", year: 2014, arxivId: "1409.3215", tags: ["seq2seq", "encoder-decoder", "landmark"], abstract: "Enabled end-to-end mapping of input sequences to output sequences, removing the need for complex feature engineering.", citations: 25000, highlight: true, era: "Deep Learning" },
    { id: "attention", title: "Attention Is All You Need", authors: "Vaswani, Shazeer, Parmar, et al.", venue: "NeurIPS", year: 2017, arxivId: "1706.03762", tags: ["transformer", "attention", "landmark"], abstract: "Introduced the Transformer architecture based solely on attention mechanisms, becoming the foundation for all modern LLMs.", citations: 95000, highlight: true, era: "Deep Learning" },
    { id: "google-duplex", title: "Google Duplex: An AI System for Real-World Tasks Over the Phone", authors: "Leviathan, Matias", venue: "Google AI Blog", year: 2018, link: "https://ai.googleblog.com/2018/05/duplex-ai-system-for-natural-conversation.html", tags: ["conversational-AI", "disfluency", "Google", "landmark"], abstract: "Demonstrated human-like disfluencies (um, uh) to mask latency. Successfully booked appointments by mimicking human speech pauses.", citations: 1250, highlight: true, era: "Deep Learning" },

    // Generative Era (2020+)
    { id: "meena", title: "Recipes for Building an Open-Domain Chatbot (Meena)", authors: "Adiwardana et al.", venue: "arXiv", year: 2020, arxivId: "2001.09977", tags: ["chatbot", "evaluation", "SSA"], abstract: "Proposed SSA (Sensibleness & Specificity) metric. Showed perplexity correlates with human evaluation.", citations: 1500, era: "Generative" },
    { id: "gslm", title: "GSLM: Textless Speech-to-Speech Translation", authors: "Lakhotia et al.", venue: "arXiv", year: 2021, arxivId: "2102.01192", tags: ["textless", "speech-tokens", "Meta"], abstract: "Modeled speech directly without text, preserving prosody and emotion. The precursor to modern Audio LLMs.", citations: 890, era: "Generative" },
    { id: "instructgpt", title: "Training Language Models to Follow Instructions with Human Feedback", authors: "Ouyang, Wu, Jiang, et al.", venue: "NeurIPS", year: 2022, arxivId: "2203.02155", tags: ["RLHF", "alignment", "OpenAI", "landmark"], abstract: "The paper behind ChatGPT. Used RLHF to align language models with user intent.", citations: 8500, highlight: true, era: "Generative" },
    { id: "whisper", title: "Robust Speech Recognition via Large-Scale Weak Supervision", authors: "Radford, Kim, Xu, et al.", venue: "ICML", year: 2023, arxivId: "2212.04356", tags: ["ASR", "foundation-model", "OpenAI", "landmark"], abstract: "Whisper is trained on 680,000 hours of multilingual data, achieving robust speech recognition that generalizes well across domains.", citations: 2100, highlight: true, era: "Generative" },
    { id: "generative-agents", title: "Generative Agents: Interactive Simulacra of Human Behavior", authors: "Park et al.", venue: "UIST", year: 2023, arxivId: "2304.03442", tags: ["agents", "simulation", "memory"], abstract: "Demonstrated LLM-based agents can maintain memory, plan, and interact socially in persistent environments (Smallville).", citations: 2500, era: "Generative" },
    { id: "gpt-4o", title: "GPT-4o System Card", authors: "OpenAI", venue: "OpenAI", year: 2024, link: "https://openai.com/index/gpt-4o-system-card/", tags: ["multimodal", "real-time", "omni", "OpenAI", "landmark"], abstract: "Native Multimodal model with ~320ms audio response latency, emotion perception, and real-time duplex capabilities.", citations: 890, highlight: true, era: "Generative" },
    { id: "moshi", title: "Moshi: A Full-Duplex Speech-to-Speech Foundation Model", authors: "Kyutai Labs", venue: "arXiv", year: 2024, arxivId: "2410.00037", tags: ["full-duplex", "speech-to-speech", "open-source", "landmark"], abstract: "Enables simultaneous listening and speaking (full-duplex) with the Mimi codec (80ms frame size).", citations: 156, highlight: true, era: "Generative" },
    { id: "lslm", title: "Language Model Can Listen While Speaking", authors: "Ma et al.", venue: "AAAI", year: 2025, arxivId: "2408.02622", tags: ["full-duplex", "barge-in", "LSLM"], abstract: "Proposed Listening-while-Speaking architecture to handle barge-in interruptions natively.", citations: 45, era: "Generative" },
    { id: "glm-4-voice", title: "GLM-4-Voice: End-to-End Chinese Voice Conversational Model", authors: "Zhipu AI", venue: "arXiv", year: 2024, arxivId: "2024.glm4voice", tags: ["speech-native", "Chinese", "end-to-end"], abstract: "Speech-native multimodal model supporting end-to-end voice conversation with emotion understanding.", citations: 67, era: "Generative" },
    { id: "qwen2-audio", title: "Qwen2-Audio: Advancing General Audio Perception with LLMs", authors: "Alibaba Qwen Team", venue: "arXiv", year: 2024, arxivId: "2407.10759", tags: ["audio-LM", "multimodal", "Alibaba"], abstract: "Extends audio understanding beyond speech to environmental sounds, music, and complex audio scenes.", citations: 89, era: "Generative" },
    { id: "salmonn", title: "SALMONN: Towards Generic Hearing Abilities for LLMs", authors: "Various Authors", venue: "ICLR", year: 2024, arxivId: "2310.13289", tags: ["audio-LM", "multimodal", "hearing"], abstract: "Bridges speech/audio encoders with LLMs for generic hearing abilities including ASR, captioning, and event detection.", citations: 145, era: "Generative" },
    { id: "audiopalm", title: "AudioPaLM: A Large Language Model That Can Speak and Listen", authors: "Google Research", venue: "arXiv", year: 2023, arxivId: "2306.12925", tags: ["speech-to-speech", "Google", "LLM"], abstract: "Fuses text-based and speech-based language models, enabling speech-to-speech translation.", citations: 234, era: "Generative" },

    // Benchmarks
    { id: "superb", title: "SUPERB: Speech Processing Universal PERformance Benchmark", authors: "Yang et al.", venue: "INTERSPEECH", year: 2021, arxivId: "2105.01051", tags: ["benchmark", "ASR", "foundation-model"], abstract: "Benchmark for evaluating speech processing across ASR, KWS, Speaker ID, Intent Classification, and Emotion Recognition.", citations: 892, era: "Generative" },
    { id: "vocalbench", title: "VocalBench: Benchmarking Vocal Conversational Abilities", authors: "Various Authors", venue: "arXiv", year: 2024, arxivId: "2024.vocalbench", tags: ["benchmark", "conversation", "speech"], abstract: "9,400 instances across semantic, acoustic, and robustness dimensions for speech conversational assessment.", citations: 31, era: "Generative" },
    { id: "mt-bench", title: "MT-Bench: Multi-Turn Benchmark for LLM Conversation", authors: "Various Authors", venue: "arXiv", year: 2023, arxivId: "2306.05685", tags: ["benchmark", "multi-turn", "LLM"], abstract: "Assesses LLMs in multi-turn dialogues, focusing on context maintenance and reasoning across eight categories.", citations: 423, era: "Generative" },
    { id: "chatbot-arena", title: "Chatbot Arena: Evaluating LLMs by Human Preference", authors: "LMSYS", venue: "arXiv", year: 2024, arxivId: "2403.04132", tags: ["evaluation", "human-preference", "LLM"], abstract: "Open environment for evaluating LLMs based on human preferences through pairwise comparisons.", citations: 234, era: "Generative" },
];

// ==========================================
// Experience Gaps Data
// ==========================================
const experienceGaps = [
    { icon: Timer, title: "Turn-Taking Gap", target: "< 500ms", color: "amber", description: "用户说完后，Agent 需要 1-3秒 才能回应，破坏对话流动感", solution: "End-to-End Models" },
    { icon: MessageSquare, title: "Barge-In", target: "Duplex Stream", color: "cyan", description: "传统系统无法在说话时'听见'用户打断，用户必须等机器说完", solution: "Full-Duplex Architecture" },
    { icon: Volume2, title: "Prosody & Affect", target: "Audio Tokens", color: "pink", description: "文本中间层丢失了语调、情感、笑声，导致交互'没有灵魂'", solution: "Speech-Native Models" },
    { icon: Layers, title: "Context & Memory", target: "Agent System", color: "emerald", description: "单一模型无法处理复杂任务，需要工具调用、长期记忆和安全策略", solution: "Orchestration Layer" },
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
    { icon: Clock, title: "~200ms", subtitle: "Human Turn Gap", description: "人类对话间隙约 200ms，GPT-4o 已达 320ms", color: "blue" },
    { icon: TrendingUp, title: "75+ Years", subtitle: "Research History", description: "从 1950 年图灵测试到 2026 年全双工交互", color: "purple" },
    { icon: Zap, title: "Full-Duplex", subtitle: "Target Architecture", description: "边听边说，Moshi/GPT-4o 代表性突破", color: "pink" },
    { icon: Brain, title: "5.1% WER", subtitle: "Human Parity", description: "2017年微软 Switchboard 达到人类水平", color: "orange" },
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

export default function Home() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedEra, setSelectedEra] = useState<string>('all');
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
        return [...result].sort((a, b) =>
            sortBy === 'citations' ? (b.citations || 0) - (a.citations || 0) : b.year - a.year
        );
    }, [searchQuery, selectedTags, selectedEra, sortBy]);

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
                            {['insights', 'gaps', 'timeline', 'papers'].map(section => (
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
                    从 1950 年图灵测试到 2026 年全双工实时交互<br />
                    解析 Human-Agent Interaction 的核心鸿沟、架构演进与关键文献
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
                                <article key={paper.id} className={`card ${paper.highlight ? 'card-highlight' : ''}`}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                                <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{paper.year}</span>
                                                {paper.era && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }}>{paper.era}</span>}
                                                {paper.highlight && <span className="badge badge-landmark"><Sparkles className="w-3 h-3" /> Landmark</span>}
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
