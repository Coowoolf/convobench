'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (task: TaskFormData) => Promise<void>;
    initialData?: TaskFormData;
}

export interface TaskFormData {
    name: string;
    description: string;
    type: 'capability' | 'regression';
    category: string;
    systemPrompt: string;
    checkpoints: string[];
}

export function TaskModal({ isOpen, onClose, onSubmit, initialData }: TaskModalProps) {
    const [formData, setFormData] = useState<TaskFormData>(
        initialData || {
            name: '',
            description: '',
            type: 'capability',
            category: '',
            systemPrompt: '',
            checkpoints: [],
        }
    );
    const [checkpointInput, setCheckpointInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Failed to submit task:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const addCheckpoint = () => {
        if (checkpointInput.trim()) {
            setFormData(prev => ({
                ...prev,
                checkpoints: [...prev.checkpoints, checkpointInput.trim()],
            }));
            setCheckpointInput('');
        }
    };

    const removeCheckpoint = (index: number) => {
        setFormData(prev => ({
            ...prev,
            checkpoints: prev.checkpoints.filter((_, i) => i !== index),
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card p-6 m-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">
                        {initialData ? '编辑任务' : '创建新任务'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--card-hover)] rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2">任务名称 *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="例如：客服退款场景"
                            className="w-full px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2">描述</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="描述这个评测任务的目的和场景"
                            rows={3}
                            className="w-full px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] resize-none"
                        />
                    </div>

                    {/* Type & Category */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">类型 *</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as 'capability' | 'regression' }))}
                                className="w-full px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
                            >
                                <option value="capability">能力评估</option>
                                <option value="regression">回归评估</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">类别</label>
                            <input
                                type="text"
                                value={formData.category}
                                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                placeholder="例如：客服、外呼、核心能力"
                                className="w-full px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
                            />
                        </div>
                    </div>

                    {/* System Prompt */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Agent System Prompt</label>
                        <textarea
                            value={formData.systemPrompt}
                            onChange={e => setFormData(prev => ({ ...prev, systemPrompt: e.target.value }))}
                            placeholder="定义 Agent 的角色和行为..."
                            rows={4}
                            className="w-full px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] resize-none font-mono text-sm"
                        />
                    </div>

                    {/* Checkpoints */}
                    <div>
                        <label className="block text-sm font-medium mb-2">检查点</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={checkpointInput}
                                onChange={e => setCheckpointInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCheckpoint())}
                                placeholder="添加检查点..."
                                className="flex-1 px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
                            />
                            <button
                                type="button"
                                onClick={addCheckpoint}
                                className="px-4 py-2.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg hover:bg-[var(--primary)]/20 transition-colors"
                            >
                                添加
                            </button>
                        </div>
                        {formData.checkpoints.length > 0 && (
                            <div className="space-y-2">
                                {formData.checkpoints.map((cp, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 px-3 py-2 bg-[var(--card-hover)] rounded-lg"
                                    >
                                        <span className="text-sm text-[var(--muted)]">{index + 1}.</span>
                                        <span className="flex-1 text-sm">{cp}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeCheckpoint(index)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-[var(--muted)] hover:bg-[var(--card-hover)] rounded-lg transition-colors"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !formData.name}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? '保存中...' : initialData ? '保存修改' : '创建任务'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
