'use client';

import {
    TrendingUp,
    Clock,
    CheckCircle2,
    XCircle,
    Activity,
    Zap
} from 'lucide-react';
import { useApp } from './context';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

export function Dashboard() {
    const { dashboard, tasks, suites } = useApp();

    const recentTasks = tasks.slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Voice Agent Evals</h1>
                    <p className="text-[var(--muted)] mt-1">声网对话式 AI 引擎评测平台</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    运行全部评测
                </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-4 gap-4">
                <MetricCard
                    icon={<Activity className="w-6 h-6 text-indigo-400" />}
                    label="总任务数"
                    value={dashboard.totalTasks}
                    suffix="个"
                    trend={+5}
                />
                <MetricCard
                    icon={<CheckCircle2 className="w-6 h-6 text-emerald-400" />}
                    label="平均通过率"
                    value={dashboard.avgPassRate}
                    suffix="%"
                    trend={+2.3}
                />
                <MetricCard
                    icon={<Clock className="w-6 h-6 text-amber-400" />}
                    label="平均延迟"
                    value={dashboard.avgLatency}
                    suffix="ms"
                    trend={-8}
                />
                <MetricCard
                    icon={<TrendingUp className="w-6 h-6 text-purple-400" />}
                    label="总运行次数"
                    value={dashboard.totalRuns.toLocaleString()}
                    suffix=""
                    trend={+12}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-6">
                {/* Pass Rate Trend */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold mb-4">通过率趋势</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dashboard.passRateTrend}>
                                <defs>
                                    <linearGradient id="capabilityGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="regressionGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                                <YAxis stroke="#6b7280" fontSize={12} domain={[60, 100]} />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1a1a24',
                                        border: '1px solid #2a2a3a',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="capability"
                                    stroke="#6366f1"
                                    fill="url(#capabilityGradient)"
                                    strokeWidth={2}
                                    name="能力评估"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="regression"
                                    stroke="#10b981"
                                    fill="url(#regressionGradient)"
                                    strokeWidth={2}
                                    name="回归评估"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex gap-6 mt-4 justify-center">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-indigo-500" />
                            <span className="text-sm text-[var(--muted)]">能力评估 ({dashboard.capabilityEvals})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span className="text-sm text-[var(--muted)]">回归评估 ({dashboard.regressionEvals})</span>
                        </div>
                    </div>
                </div>

                {/* Latency Trend */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold mb-4">延迟趋势 (ms)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dashboard.latencyTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                                <YAxis stroke="#6b7280" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1a1a24',
                                        border: '1px solid #2a2a3a',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Line type="monotone" dataKey="asr" stroke="#f59e0b" strokeWidth={2} dot={false} name="ASR" />
                                <Line type="monotone" dataKey="llm" stroke="#ec4899" strokeWidth={2} dot={false} name="LLM" />
                                <Line type="monotone" dataKey="tts" stroke="#06b6d4" strokeWidth={2} dot={false} name="TTS" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex gap-6 mt-4 justify-center">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            <span className="text-sm text-[var(--muted)]">ASR 延迟</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-pink-500" />
                            <span className="text-sm text-[var(--muted)]">LLM TTF</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-cyan-500" />
                            <span className="text-sm text-[var(--muted)]">TTS 延迟</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-3 gap-6">
                {/* Recent Tasks */}
                <div className="glass-card p-6 col-span-2">
                    <h3 className="text-lg font-semibold mb-4">最近评测任务</h3>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>任务名称</th>
                                <th>类型</th>
                                <th>状态</th>
                                <th>通过率</th>
                                <th>延迟</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTasks.map((task) => (
                                <tr key={task.id}>
                                    <td className="font-medium">{task.name}</td>
                                    <td>
                                        <span className={`badge ${task.type === 'capability' ? 'badge-warning' : 'badge-success'}`}>
                                            {task.type === 'capability' ? '能力' : '回归'}
                                        </span>
                                    </td>
                                    <td>
                                        {task.status === 'passed' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                                        {task.status === 'failed' && <XCircle className="w-5 h-5 text-red-400" />}
                                        {task.status === 'running' && <Activity className="w-5 h-5 text-amber-400 animate-pulse" />}
                                        {task.status === 'pending' && <Clock className="w-5 h-5 text-gray-400" />}
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="progress-bar w-20">
                                                <div
                                                    className="progress-fill"
                                                    style={{
                                                        width: `${task.passRate}%`,
                                                        background: task.passRate >= 80 ? '#10b981' : task.passRate >= 60 ? '#f59e0b' : '#ef4444'
                                                    }}
                                                />
                                            </div>
                                            <span className="text-sm">{task.passRate}%</span>
                                        </div>
                                    </td>
                                    <td className="text-[var(--muted)]">{task.avgLatency}ms</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Suites Status */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold mb-4">套件状态</h3>
                    <div className="space-y-4">
                        {suites.map((suite) => (
                            <div key={suite.id} className="p-4 rounded-lg bg-[var(--card-hover)]">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">{suite.name}</span>
                                    <span className={`badge ${suite.status === 'healthy' ? 'badge-success' :
                                            suite.status === 'warning' ? 'badge-warning' : 'badge-danger'
                                        }`}>
                                        {suite.status === 'healthy' ? '健康' :
                                            suite.status === 'warning' ? '注意' : '饱和'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                                    <span>{suite.taskCount} 个任务</span>
                                    <span>•</span>
                                    <span>{suite.passRate}% 通过率</span>
                                </div>
                                <div className="progress-bar mt-2">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${suite.passRate}%`,
                                            background: suite.status === 'healthy' ? '#10b981' :
                                                suite.status === 'warning' ? '#f59e0b' : '#6366f1'
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ icon, label, value, suffix, trend }: {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    suffix: string;
    trend: number;
}) {
    const isPositive = trend > 0;
    const trendColor = label.includes('延迟')
        ? (isPositive ? 'text-red-400' : 'text-emerald-400')
        : (isPositive ? 'text-emerald-400' : 'text-red-400');

    return (
        <div className="metric-card">
            <div className="flex items-center justify-between mb-3">
                {icon}
                <span className={`text-sm ${trendColor}`}>
                    {isPositive ? '+' : ''}{trend}{suffix || '%'}
                </span>
            </div>
            <div className="text-3xl font-bold">{value}<span className="text-lg text-[var(--muted)]">{suffix}</span></div>
            <div className="text-sm text-[var(--muted)] mt-1">{label}</div>
        </div>
    );
}
