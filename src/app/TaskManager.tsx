'use client';

import {
    Plus,
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    Clock,
    Activity,
    ChevronRight,
    Edit2,
    Trash2,
    Play,
    Loader2
} from 'lucide-react';
import { useApp, EvalTask } from './context';
import { useState } from 'react';
import { TaskModal, type TaskFormData } from './TaskModal';

export function TaskManager() {
    const { tasks, setSelectedTask, setCurrentPage, createTask, deleteTask, runEval, isLoadingTasks } = useApp();
    const [filter, setFilter] = useState<'all' | 'capability' | 'regression'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

    const filteredTasks = tasks.filter(task => {
        const matchesFilter = filter === 'all' || task.type === filter;
        const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleViewTranscript = (task: EvalTask) => {
        setSelectedTask(task);
        setCurrentPage('transcripts');
    };

    const handleCreateTask = async (formData: TaskFormData) => {
        await createTask({
            name: formData.name,
            description: formData.description,
            type: formData.type,
            category: formData.category || 'general',
            systemPrompt: formData.systemPrompt,
            checkpoints: formData.checkpoints,
        });
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm('确定要删除这个任务吗？')) return;
        setDeletingTaskId(taskId);
        try {
            await deleteTask(taskId);
        } finally {
            setDeletingTaskId(null);
        }
    };

    const handleRunEval = async (taskId: string) => {
        setRunningTaskId(taskId);
        try {
            await runEval(taskId, 'mock');
        } finally {
            setRunningTaskId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">任务管理</h1>
                    <p className="text-[var(--muted)] mt-1">管理和配置评测任务</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    创建任务
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                    <input
                        type="text"
                        placeholder="搜索任务名称或类别..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-[var(--muted)]" />
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${filter === 'all' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--card)] text-[var(--muted)]'}`}
                    >
                        全部 ({tasks.length})
                    </button>
                    <button
                        onClick={() => setFilter('capability')}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${filter === 'capability' ? 'bg-amber-500/20 text-amber-400' : 'bg-[var(--card)] text-[var(--muted)]'}`}
                    >
                        能力评估
                    </button>
                    <button
                        onClick={() => setFilter('regression')}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${filter === 'regression' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[var(--card)] text-[var(--muted)]'}`}
                    >
                        回归评估
                    </button>
                </div>
            </div>

            {/* Loading state */}
            {isLoadingTasks && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
                </div>
            )}

            {/* Empty state */}
            {!isLoadingTasks && filteredTasks.length === 0 && (
                <div className="glass-card p-12 text-center">
                    <div className="text-4xl mb-4">📋</div>
                    <h3 className="text-lg font-semibold mb-2">暂无任务</h3>
                    <p className="text-[var(--muted)] mb-4">点击"创建任务"开始添加评测任务</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary"
                    >
                        <Plus className="w-4 h-4 mr-2 inline" />
                        创建第一个任务
                    </button>
                </div>
            )}

            {/* Task Cards */}
            <div className="grid grid-cols-2 gap-4">
                {filteredTasks.map((task) => (
                    <div key={task.id} className="glass-card p-5 hover:border-[var(--primary)] transition-colors">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <StatusIcon status={task.status} />
                                <div>
                                    <h3 className="font-semibold">{task.name}</h3>
                                    <p className="text-sm text-[var(--muted)]">{task.category}</p>
                                </div>
                            </div>
                            <span className={`badge ${task.type === 'capability' ? 'badge-warning' : 'badge-success'}`}>
                                {task.type === 'capability' ? '能力' : '回归'}
                            </span>
                        </div>

                        <p className="text-sm text-[var(--muted)] mb-4 line-clamp-2">{task.description}</p>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                                <div className="text-xs text-[var(--muted)]">通过率</div>
                                <div className="font-semibold flex items-center gap-2">
                                    {task.passRate}%
                                    <div className="progress-bar flex-1">
                                        <div
                                            className="progress-fill"
                                            style={{
                                                width: `${task.passRate}%`,
                                                background: task.passRate >= 80 ? '#10b981' : task.passRate >= 60 ? '#f59e0b' : '#ef4444'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-[var(--muted)]">平均延迟</div>
                                <div className="font-semibold">{task.avgLatency}ms</div>
                            </div>
                            <div>
                                <div className="text-xs text-[var(--muted)]">试验次数</div>
                                <div className="font-semibold">{task.trials}</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                            <span className="text-xs text-[var(--muted)]">最后运行: {task.lastRun}</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleRunEval(task.id)}
                                    disabled={runningTaskId === task.id}
                                    className="p-2 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors disabled:opacity-50"
                                    title="运行评测"
                                >
                                    {runningTaskId === task.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Play className="w-4 h-4" />
                                    )}
                                </button>
                                <button className="p-2 hover:bg-[var(--card-hover)] rounded-lg transition-colors">
                                    <Edit2 className="w-4 h-4 text-[var(--muted)]" />
                                </button>
                                <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    disabled={deletingTaskId === task.id}
                                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {deletingTaskId === task.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                                    ) : (
                                        <Trash2 className="w-4 h-4 text-[var(--muted)] hover:text-red-400" />
                                    )}
                                </button>
                                <button
                                    onClick={() => handleViewTranscript(task)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors"
                                >
                                    查看轨迹 <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Task Modal */}
            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateTask}
            />
        </div>
    );
}

function StatusIcon({ status }: { status: EvalTask['status'] }) {
    switch (status) {
        case 'passed':
            return <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>;
        case 'failed':
            return <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
            </div>;
        case 'running':
            return <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>;
        default:
            return <div className="w-10 h-10 rounded-xl bg-gray-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-gray-400" />
            </div>;
    }
}
