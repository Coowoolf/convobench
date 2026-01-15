'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types
export interface EvalTask {
  id: string;
  name: string;
  description: string;
  type: 'capability' | 'regression';
  category: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  passRate: number;
  avgLatency: number;
  lastRun: string;
  trials: number;
}

export interface EvalSuite {
  id: string;
  name: string;
  description: string;
  taskCount: number;
  passRate: number;
  lastRun: string;
  status: 'healthy' | 'warning' | 'saturated';
}

export interface EvalRun {
  id: string;
  taskId: string;
  taskName: string;
  status: 'running' | 'passed' | 'failed';
  startTime: string;
  endTime?: string;
  metrics: {
    asrLatency: number;
    llmTTF: number;
    ttsLatency: number;
    e2eLatency: number;
    intentAccuracy: number;
    taskCompletion: boolean;
  };
  transcript: TranscriptTurn[];
}

export interface TranscriptTurn {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
  audioUrl?: string;
  metrics?: {
    asrLatency?: number;
    llmLatency?: number;
    ttsLatency?: number;
  };
  toolCalls?: {
    name: string;
    params: Record<string, unknown>;
    result: string;
  }[];
}

interface DashboardMetrics {
  totalTasks: number;
  avgPassRate: number;
  avgLatency: number;
  totalRuns: number;
  capabilityEvals: number;
  regressionEvals: number;
  passRateTrend: { date: string; capability: number; regression: number }[];
  latencyTrend: { date: string; asr: number; llm: number; tts: number }[];
}

// Mock Data
const mockTasks: EvalTask[] = [
  { id: '1', name: '客服退款场景', description: '测试Agent处理退款请求的完整流程', type: 'capability', category: '客服', status: 'passed', passRate: 87, avgLatency: 1250, lastRun: '2026-01-14 23:45', trials: 50 },
  { id: '2', name: '打断响应测试', description: '用户打断时Agent的响应能力', type: 'capability', category: '核心能力', status: 'failed', passRate: 62, avgLatency: 890, lastRun: '2026-01-14 23:30', trials: 100 },
  { id: '3', name: '意图识别-预约', description: '识别用户预约意图', type: 'regression', category: '意图', status: 'passed', passRate: 95, avgLatency: 1100, lastRun: '2026-01-14 23:00', trials: 200 },
  { id: '4', name: '外呼开场白', description: '测试外呼场景开场白效果', type: 'capability', category: '外呼', status: 'running', passRate: 78, avgLatency: 1450, lastRun: '2026-01-14 22:30', trials: 30 },
  { id: '5', name: '多轮对话保持', description: '测试Agent维持多轮对话上下文', type: 'regression', category: '核心能力', status: 'passed', passRate: 91, avgLatency: 980, lastRun: '2026-01-14 22:00', trials: 150 },
  { id: '6', name: '情感共情', description: '测试Agent对用户情绪的共情能力', type: 'capability', category: '对话质量', status: 'passed', passRate: 73, avgLatency: 1320, lastRun: '2026-01-14 21:30', trials: 80 },
];

const mockSuites: EvalSuite[] = [
  { id: '1', name: '客服场景套件', description: '包含退款、咨询、投诉等客服场景', taskCount: 24, passRate: 85, lastRun: '2026-01-14 23:45', status: 'healthy' },
  { id: '2', name: '外呼场景套件', description: '外呼营销、回访、催收场景', taskCount: 18, passRate: 72, lastRun: '2026-01-14 22:30', status: 'warning' },
  { id: '3', name: '核心能力回归', description: '打断、多轮、意图识别等核心能力', taskCount: 35, passRate: 94, lastRun: '2026-01-14 23:00', status: 'saturated' },
];

const mockRuns: EvalRun[] = [
  {
    id: '1',
    taskId: '1',
    taskName: '客服退款场景',
    status: 'passed',
    startTime: '2026-01-14 23:40:12',
    endTime: '2026-01-14 23:42:35',
    metrics: { asrLatency: 280, llmTTF: 450, ttsLatency: 320, e2eLatency: 1250, intentAccuracy: 0.95, taskCompletion: true },
    transcript: [
      { id: '1', role: 'system', content: '开始评测任务：客服退款场景', timestamp: '23:40:12' },
      { id: '2', role: 'user', content: '你好，我想退掉上周买的那个耳机', timestamp: '23:40:15', metrics: { asrLatency: 280 } },
      { id: '3', role: 'agent', content: '好的，我来帮您查一下订单。请问您能提供一下订单号吗？', timestamp: '23:40:17', metrics: { llmLatency: 420, ttsLatency: 310 }, toolCalls: [{ name: 'query_order', params: { keyword: '耳机' }, result: '找到3个订单' }] },
      { id: '4', role: 'user', content: '订单号是 A20260108001', timestamp: '23:40:25', metrics: { asrLatency: 265 } },
      { id: '5', role: 'agent', content: '查到了，是1月8日购买的蓝牙耳机，199元。根据我们的退款政策，7天内可以无理由退款。我现在就帮您申请退款，预计1-3个工作日到账。', timestamp: '23:40:28', metrics: { llmLatency: 480, ttsLatency: 340 }, toolCalls: [{ name: 'process_refund', params: { orderId: 'A20260108001', amount: 199 }, result: '退款成功' }] },
      { id: '6', role: 'user', content: '好的谢谢', timestamp: '23:40:45' },
      { id: '7', role: 'system', content: '✅ 任务完成 | 通过所有检查点', timestamp: '23:42:35' },
    ]
  },
  {
    id: '2',
    taskId: '2',
    taskName: '打断响应测试',
    status: 'failed',
    startTime: '2026-01-14 23:25:00',
    endTime: '2026-01-14 23:26:30',
    metrics: { asrLatency: 320, llmTTF: 520, ttsLatency: 380, e2eLatency: 1420, intentAccuracy: 0.72, taskCompletion: false },
    transcript: [
      { id: '1', role: 'system', content: '开始评测任务：打断响应测试', timestamp: '23:25:00' },
      { id: '2', role: 'user', content: '我想问一下...', timestamp: '23:25:03' },
      { id: '3', role: 'agent', content: '您好，欢迎致电声网客服...', timestamp: '23:25:04' },
      { id: '4', role: 'user', content: '[打断] 不用介绍了，我就想问下退款', timestamp: '23:25:05' },
      { id: '5', role: 'agent', content: '...我们提供24小时在线服务...', timestamp: '23:25:06' },
      { id: '6', role: 'system', content: '❌ 任务失败 | Agent 未能响应用户打断', timestamp: '23:26:30' },
    ]
  }
];

const mockDashboard: DashboardMetrics = {
  totalTasks: 77,
  avgPassRate: 84.2,
  avgLatency: 1180,
  totalRuns: 15420,
  capabilityEvals: 45,
  regressionEvals: 32,
  passRateTrend: [
    { date: '01-08', capability: 72, regression: 91 },
    { date: '01-09', capability: 75, regression: 92 },
    { date: '01-10', capability: 78, regression: 93 },
    { date: '01-11', capability: 80, regression: 92 },
    { date: '01-12', capability: 82, regression: 94 },
    { date: '01-13', capability: 83, regression: 93 },
    { date: '01-14', capability: 85, regression: 95 },
  ],
  latencyTrend: [
    { date: '01-08', asr: 320, llm: 520, tts: 380 },
    { date: '01-09', asr: 310, llm: 490, tts: 360 },
    { date: '01-10', asr: 300, llm: 480, tts: 350 },
    { date: '01-11', asr: 295, llm: 470, tts: 340 },
    { date: '01-12', asr: 285, llm: 460, tts: 330 },
    { date: '01-13', asr: 280, llm: 455, tts: 325 },
    { date: '01-14', asr: 275, llm: 450, tts: 320 },
  ],
};

// Context
interface AppContextType {
  tasks: EvalTask[];
  suites: EvalSuite[];
  runs: EvalRun[];
  dashboard: DashboardMetrics;
  selectedTask: EvalTask | null;
  selectedRun: EvalRun | null;
  setSelectedTask: (task: EvalTask | null) => void;
  setSelectedRun: (run: EvalRun | null) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedTask, setSelectedTask] = useState<EvalTask | null>(null);
  const [selectedRun, setSelectedRun] = useState<EvalRun | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <AppContext.Provider value={{
      tasks: mockTasks,
      suites: mockSuites,
      runs: mockRuns,
      dashboard: mockDashboard,
      selectedTask,
      selectedRun,
      setSelectedTask,
      setSelectedRun,
      currentPage,
      setCurrentPage,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
