'use client';

import {
    TrendingUp,
    Clock,
    DollarSign,
    Activity,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { useApp } from './context';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis
} from 'recharts';

export function Analytics() {
    const { dashboard, tasks } = useApp();

    const categoryData = [
        { name: '客服', value: 28, fill: '#6366f1' },
        { name: '外呼', value: 22, fill: '#8b5cf6' },
        { name: '意图识别', value: 18, fill: '#a855f7' },
        { name: '核心能力', value: 15, fill: '#d946ef' },
        { name: '对话质量', value: 12, fill: '#ec4899' },
    ];

    const modelComparison = [
        { model: 'GPT-4o', passRate: 85, latency: 1250, cost: 0.032 },
        { model: 'Claude 3.5', passRate: 88, latency: 1180, cost: 0.028 },
        { model: 'Gemini Pro', passRate: 82, latency: 1320, cost: 0.025 },
        { model: 'Qwen 2.5', passRate: 79, latency: 980, cost: 0.012 },
    ];

    const radarData = [
        { metric: '响应速度', value: 85, fullMark: 100 },
        { metric: '意图准确', value: 92, fullMark: 100 },
        { metric: '任务完成', value: 78, fullMark: 100 },
        { metric: '对话连贯', value: 88, fullMark: 100 },
        { metric: '情感共情', value: 72, fullMark: 100 },
        { metric: '打断响应', value: 65, fullMark: 100 },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">分析报告</h1>
                <p className="text-[var(--muted)] mt-1">AI Agent 评测数据分析与洞察</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard
                    icon={<TrendingUp className="w-5 h-5" />}
                    label="本周通过率变化"
                    value="+5.2%"
                    trend="up"
                    color="emerald"
                />
                <StatCard
                    icon={<Clock className="w-5 h-5" />}
                    label="平均延迟优化"
                    value="-120ms"
                    trend="up"
                    color="cyan"
                />
                <StatCard
                    icon={<Activity className="w-5 h-5" />}
                    label="评测覆盖率"
                    value="87%"
                    trend="up"
                    color="purple"
                />
                <StatCard
                    icon={<DollarSign className="w-5 h-5" />}
                    label="本周评测成本"
                    value="$128.50"
                    trend="down"
                    color="amber"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-2 gap-6">
                {/* Category Distribution */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold mb-4">任务分类分布</h3>
                    <div className="h-64 flex items-center">
                        <ResponsiveContainer width="60%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: '#1a1a24',
                                        border: '1px solid #2a2a3a',
                                        borderRadius: '8px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2">
                            {categoryData.map((cat) => (
                                <div key={cat.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ background: cat.fill }} />
                                    <span className="text-sm">{cat.name}</span>
                                    <span className="text-sm text-[var(--muted)]">({cat.value})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Agent Capability Radar */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold mb-4">Agent 能力雷达图</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#2a2a3a" />
                                <PolarAngleAxis dataKey="metric" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280' }} />
                                <Radar
                                    name="当前能力"
                                    dataKey="value"
                                    stroke="#6366f1"
                                    fill="#6366f1"
                                    fillOpacity={0.3}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Model Comparison */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">模型对比分析</h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={modelComparison} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                            <XAxis type="number" stroke="#6b7280" fontSize={12} />
                            <YAxis dataKey="model" type="category" stroke="#6b7280" fontSize={12} width={80} />
                            <Tooltip
                                contentStyle={{
                                    background: '#1a1a24',
                                    border: '1px solid #2a2a3a',
                                    borderRadius: '8px'
                                }}
                            />
                            <Bar dataKey="passRate" name="通过率 %" fill="#6366f1" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-4">
                    {modelComparison.map((model) => (
                        <div key={model.model} className="p-4 rounded-lg bg-[var(--card-hover)]">
                            <div className="font-medium mb-2">{model.model}</div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                    <div className="text-[var(--muted)]">通过率</div>
                                    <div className="font-semibold text-emerald-400">{model.passRate}%</div>
                                </div>
                                <div>
                                    <div className="text-[var(--muted)]">延迟</div>
                                    <div className="font-semibold text-amber-400">{model.latency}ms</div>
                                </div>
                                <div>
                                    <div className="text-[var(--muted)]">成本</div>
                                    <div className="font-semibold text-cyan-400">${model.cost}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, trend, color }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    trend: 'up' | 'down';
    color: string;
}) {
    const colorClasses: Record<string, string> = {
        emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
        cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30',
        purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
        amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
    };

    const iconColors: Record<string, string> = {
        emerald: 'text-emerald-400',
        cyan: 'text-cyan-400',
        purple: 'text-purple-400',
        amber: 'text-amber-400',
    };

    return (
        <div className={`p-5 rounded-xl border bg-gradient-to-br ${colorClasses[color]}`}>
            <div className="flex items-center justify-between mb-3">
                <div className={iconColors[color]}>{icon}</div>
                {trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-400" />
                )}
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm text-[var(--muted)] mt-1">{label}</div>
        </div>
    );
}
