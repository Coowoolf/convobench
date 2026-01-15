'use client';

import {
    LayoutDashboard,
    ListTodo,
    FolderKanban,
    Play,
    FileText,
    BarChart3,
    Settings,
    Mic
} from 'lucide-react';
import { useApp } from './context';

const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: '仪表盘' },
    { id: 'tasks', icon: ListTodo, label: '任务管理' },
    { id: 'suites', icon: FolderKanban, label: '评测套件' },
    { id: 'runner', icon: Play, label: '运行评测' },
    { id: 'transcripts', icon: FileText, label: '轨迹查看' },
    { id: 'analytics', icon: BarChart3, label: '分析报告' },
];

export function Sidebar() {
    const { currentPage, setCurrentPage } = useApp();

    return (
        <aside className="sidebar w-64 h-screen fixed left-0 top-0 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Mic className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg">ConvoBench</h1>
                        <p className="text-xs text-[var(--muted)]">Agora AI Engine</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setCurrentPage(item.id)}
                        className={`sidebar-item w-full ${currentPage === item.id ? 'active' : ''}`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Settings */}
            <div className="p-4 border-t border-[var(--border)]">
                <button className="sidebar-item w-full">
                    <Settings className="w-5 h-5" />
                    <span>设置</span>
                </button>
            </div>
        </aside>
    );
}
