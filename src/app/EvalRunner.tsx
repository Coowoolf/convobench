'use client';

import {
    Play,
    Pause,
    RotateCcw,
    CheckCircle2,
    XCircle,
    Clock,
    Loader2
} from 'lucide-react';
import { useApp } from './context';
import { useState } from 'react';

export function EvalRunner() {
    const { tasks, suites } = useApp();
    const [running, setRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [selectedSuite, setSelectedSuite] = useState<string | null>(null);

    const handleRunAll = () => {
        setRunning(true);
        setProgress(0);
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setRunning(false);
                    return 100;
                }
                return prev + 2;
            });
        }, 100);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">运行评测</h1>
                    <p className="text-[var(--muted)] mt-1">执行评测任务并查看实时进度</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setProgress(0);
                            setRunning(false);
                        }}
                        className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--card-hover)] transition-colors flex items-center gap-2"
                    >
                        <RotateCcw className="w-4 h-4" />
                        重置
                    </button>
                    <button
                        onClick={handleRunAll}
                        disabled={running}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                        {running ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                运行中...
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4" />
                                运行全部
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Progress */}
            {(running || progress > 0) && (
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">评测进度</span>
                        <span className="text-[var(--primary)]">{progress}%</span>
                    </div>
                    <div className="h-3 bg-[var(--border)] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-[var(--muted)]">
                        <span>已完成: {Math.floor(progress * 0.77)} / 77 任务</span>
                        <span>预计剩余: {Math.max(0, Math.ceil((100 - progress) * 0.5))} 秒</span>
                    </div>
                </div>
            )}

            {/* Suites Grid */}
            <div className="grid grid-cols-3 gap-4">
                {suites.map((suite) => (
                    <div
                        key={suite.id}
                        onClick={() => setSelectedSuite(selectedSuite === suite.id ? null : suite.id)}
                        className={`glass-card p-5 cursor-pointer transition-all ${selectedSuite === suite.id ? 'border-[var(--primary)] ring-1 ring-[var(--primary)]' : ''
                            }`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">{suite.name}</h3>
                            <span className={`badge ${suite.status === 'healthy' ? 'badge-success' :
                                    suite.status === 'warning' ? 'badge-warning' : 'badge-danger'
                                }`}>
                                {suite.status === 'healthy' ? '健康' :
                                    suite.status === 'warning' ? '注意' : '饱和'}
                            </span>
                        </div>
                        <p className="text-sm text-[var(--muted)] mb-4">{suite.description}</p>
                        <div className="flex items-center justify-between text-sm">
                            <span>{suite.taskCount} 个任务</span>
                            <span className="text-[var(--primary)]">{suite.passRate}%</span>
                        </div>
                        <div className="progress-bar mt-2">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${suite.passRate}%`,
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Task List */}
            <div className="glass-card p-6">
                <h3 className="font-semibold mb-4">任务列表</h3>
                <div className="space-y-2">
                    {tasks.map((task, index) => (
                        <div
                            key={task.id}
                            className="flex items-center justify-between p-4 rounded-lg bg-[var(--card-hover)]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-[var(--card)] flex items-center justify-center text-sm font-medium">
                                    {index + 1}
                                </div>
                                <div>
                                    <div className="font-medium">{task.name}</div>
                                    <div className="text-sm text-[var(--muted)]">{task.category}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-[var(--muted)]">{task.trials} 试验</span>
                                {running && progress > (index / tasks.length) * 100 ? (
                                    progress >= ((index + 1) / tasks.length) * 100 ? (
                                        task.passRate >= 70 ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-400" />
                                        )
                                    ) : (
                                        <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                                    )
                                ) : (
                                    <Clock className="w-5 h-5 text-[var(--muted)]" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
