'use client';

import {
    Plus,
    Search,
    MoreVertical,
    Play,
    Trash2,
    Edit2
} from 'lucide-react';
import { useApp } from './context';

export function EvalSuites() {
    const { suites } = useApp();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">评测套件</h1>
                    <p className="text-[var(--muted)] mt-1">组织和管理评测任务集合</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    创建套件
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                <input
                    type="text"
                    placeholder="搜索套件..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
                />
            </div>

            {/* Suites Grid */}
            <div className="grid grid-cols-2 gap-6">
                {suites.map((suite) => (
                    <div key={suite.id} className="glass-card p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-semibold">{suite.name}</h3>
                                    <span className={`badge ${suite.status === 'healthy' ? 'badge-success' :
                                            suite.status === 'warning' ? 'badge-warning' : 'badge-danger'
                                        }`}>
                                        {suite.status === 'healthy' ? '健康' :
                                            suite.status === 'warning' ? '需关注' : '已饱和'}
                                    </span>
                                </div>
                                <p className="text-[var(--muted)]">{suite.description}</p>
                            </div>
                            <button className="p-2 hover:bg-[var(--card-hover)] rounded-lg">
                                <MoreVertical className="w-5 h-5 text-[var(--muted)]" />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="p-3 rounded-lg bg-[var(--card-hover)]">
                                <div className="text-2xl font-bold">{suite.taskCount}</div>
                                <div className="text-sm text-[var(--muted)]">任务数</div>
                            </div>
                            <div className="p-3 rounded-lg bg-[var(--card-hover)]">
                                <div className="text-2xl font-bold text-emerald-400">{suite.passRate}%</div>
                                <div className="text-sm text-[var(--muted)]">通过率</div>
                            </div>
                            <div className="p-3 rounded-lg bg-[var(--card-hover)]">
                                <div className="text-2xl font-bold text-amber-400">
                                    {suite.status === 'saturated' ? '100%' :
                                        suite.status === 'warning' ? '85%' : '60%'}
                                </div>
                                <div className="text-sm text-[var(--muted)]">饱和度</div>
                            </div>
                        </div>

                        <div className="text-sm text-[var(--muted)] mb-4">
                            最后运行: {suite.lastRun}
                        </div>

                        <div className="flex items-center gap-2 pt-4 border-t border-[var(--border)]">
                            <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg hover:bg-[var(--primary)]/20 transition-colors">
                                <Play className="w-4 h-4" />
                                运行套件
                            </button>
                            <button className="p-2 hover:bg-[var(--card-hover)] rounded-lg transition-colors">
                                <Edit2 className="w-4 h-4 text-[var(--muted)]" />
                            </button>
                            <button className="p-2 hover:bg-[var(--card-hover)] rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4 text-[var(--muted)]" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
