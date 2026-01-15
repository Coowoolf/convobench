'use client';

import {
    Play,
    Pause,
    RotateCcw,
    User,
    Bot,
    Settings,
    Clock,
    Zap,
    CheckCircle2,
    XCircle,
    ChevronDown,
    ChevronUp,
    Mic,
    Volume2
} from 'lucide-react';
import { useApp, TranscriptTurn } from './context';
import { useState } from 'react';

export function TranscriptViewer() {
    const { runs, selectedTask } = useApp();
    const [selectedRunId, setSelectedRunId] = useState(runs[0]?.id || '');
    const [expandedTurn, setExpandedTurn] = useState<string | null>(null);

    const selectedRun = runs.find(r => r.id === selectedRunId) || runs[0];

    if (!selectedRun) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-[var(--muted)]">暂无评测记录</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">轨迹查看器</h1>
                    <p className="text-[var(--muted)] mt-1">查看评测运行的完整对话轨迹</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Run List */}
                <div className="glass-card p-4">
                    <h3 className="font-semibold mb-4">运行记录</h3>
                    <div className="space-y-2">
                        {runs.map((run) => (
                            <button
                                key={run.id}
                                onClick={() => setSelectedRunId(run.id)}
                                className={`w-full p-3 rounded-lg text-left transition-colors ${selectedRunId === run.id
                                        ? 'bg-[var(--primary)]/20 border border-[var(--primary)]'
                                        : 'bg-[var(--card-hover)] hover:bg-[var(--card)]'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-sm">{run.taskName}</span>
                                    {run.status === 'passed' ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    ) : (
                                        <XCircle className="w-4 h-4 text-red-400" />
                                    )}
                                </div>
                                <div className="text-xs text-[var(--muted)]">{run.startTime}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Transcript */}
                <div className="glass-card p-4 col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">对话轨迹</h3>
                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-[var(--card-hover)] rounded-lg">
                                <RotateCcw className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-[var(--card-hover)] rounded-lg">
                                <Play className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {selectedRun.transcript.map((turn) => (
                            <TranscriptTurnCard
                                key={turn.id}
                                turn={turn}
                                isExpanded={expandedTurn === turn.id}
                                onToggle={() => setExpandedTurn(expandedTurn === turn.id ? null : turn.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Metrics Panel */}
            <div className="glass-card p-6">
                <h3 className="font-semibold mb-4">运行指标</h3>
                <div className="grid grid-cols-6 gap-4">
                    <MetricBadge
                        icon={<Clock className="w-4 h-4" />}
                        label="ASR 延迟"
                        value={`${selectedRun.metrics.asrLatency}ms`}
                        color="amber"
                    />
                    <MetricBadge
                        icon={<Zap className="w-4 h-4" />}
                        label="LLM TTF"
                        value={`${selectedRun.metrics.llmTTF}ms`}
                        color="pink"
                    />
                    <MetricBadge
                        icon={<Volume2 className="w-4 h-4" />}
                        label="TTS 延迟"
                        value={`${selectedRun.metrics.ttsLatency}ms`}
                        color="cyan"
                    />
                    <MetricBadge
                        icon={<Clock className="w-4 h-4" />}
                        label="端到端"
                        value={`${selectedRun.metrics.e2eLatency}ms`}
                        color="purple"
                    />
                    <MetricBadge
                        icon={<CheckCircle2 className="w-4 h-4" />}
                        label="意图准确率"
                        value={`${(selectedRun.metrics.intentAccuracy * 100).toFixed(0)}%`}
                        color="emerald"
                    />
                    <MetricBadge
                        icon={selectedRun.metrics.taskCompletion ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        label="任务完成"
                        value={selectedRun.metrics.taskCompletion ? '是' : '否'}
                        color={selectedRun.metrics.taskCompletion ? 'emerald' : 'red'}
                    />
                </div>
            </div>
        </div>
    );
}

function TranscriptTurnCard({ turn, isExpanded, onToggle }: {
    turn: TranscriptTurn;
    isExpanded: boolean;
    onToggle: () => void;
}) {
    const getRoleIcon = () => {
        switch (turn.role) {
            case 'user':
                return <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-400" />
                </div>;
            case 'agent':
                return <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-purple-400" />
                </div>;
            default:
                return <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-gray-400" />
                </div>;
        }
    };

    const getRoleName = () => {
        switch (turn.role) {
            case 'user': return '用户';
            case 'agent': return 'Agent';
            default: return '系统';
        }
    };

    const getBgColor = () => {
        switch (turn.role) {
            case 'user': return 'bg-blue-500/5 border-blue-500/20';
            case 'agent': return 'bg-purple-500/5 border-purple-500/20';
            default: return 'bg-gray-500/5 border-gray-500/20';
        }
    };

    return (
        <div className={`p-4 rounded-lg border ${getBgColor()}`}>
            <div className="flex items-start gap-3">
                {getRoleIcon()}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{getRoleName()}</span>
                            <span className="text-xs text-[var(--muted)]">{turn.timestamp}</span>
                        </div>
                        {(turn.metrics || turn.toolCalls) && (
                            <button onClick={onToggle} className="p-1 hover:bg-[var(--card-hover)] rounded">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                    <p className="text-sm">{turn.content}</p>

                    {isExpanded && (
                        <div className="mt-3 space-y-2">
                            {turn.metrics && (
                                <div className="flex gap-4 text-xs">
                                    {turn.metrics.asrLatency && (
                                        <span className="text-amber-400">ASR: {turn.metrics.asrLatency}ms</span>
                                    )}
                                    {turn.metrics.llmLatency && (
                                        <span className="text-pink-400">LLM: {turn.metrics.llmLatency}ms</span>
                                    )}
                                    {turn.metrics.ttsLatency && (
                                        <span className="text-cyan-400">TTS: {turn.metrics.ttsLatency}ms</span>
                                    )}
                                </div>
                            )}
                            {turn.toolCalls && turn.toolCalls.map((tool, idx) => (
                                <div key={idx} className="p-2 rounded bg-[var(--card)] text-xs font-mono">
                                    <span className="text-[var(--primary)]">{tool.name}</span>
                                    <span className="text-[var(--muted)]">({JSON.stringify(tool.params)})</span>
                                    <span className="text-emerald-400"> → {tool.result}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MetricBadge({ icon, label, value, color }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string;
}) {
    const colorClasses: Record<string, string> = {
        amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
        cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        red: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    return (
        <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-xs opacity-80">{label}</span>
            </div>
            <div className="text-xl font-bold">{value}</div>
        </div>
    );
}
