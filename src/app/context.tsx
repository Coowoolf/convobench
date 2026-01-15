'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import useSWR, { mutate } from 'swr';

// ==================== Types ====================
export interface EvalTask {
  id: string;
  name: string;
  description: string;
  type: 'capability' | 'regression';
  category: string;
  systemPrompt?: string;
  checkpoints?: string[];
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

// ==================== Fetcher ====================
const fetcher = (url: string) => fetch(url).then(res => res.json());

// ==================== Context ====================
interface AppContextType {
  // Data
  tasks: EvalTask[];
  suites: EvalSuite[];
  runs: EvalRun[];
  dashboard: DashboardMetrics;

  // Loading states
  isLoadingTasks: boolean;
  isLoadingSuites: boolean;
  isLoadingDashboard: boolean;

  // Selection
  selectedTask: EvalTask | null;
  selectedRun: EvalRun | null;
  setSelectedTask: (task: EvalTask | null) => void;
  setSelectedRun: (run: EvalRun | null) => void;

  // Navigation
  currentPage: string;
  setCurrentPage: (page: string) => void;

  // Actions
  createTask: (task: Omit<EvalTask, 'id' | 'status' | 'passRate' | 'avgLatency' | 'lastRun' | 'trials'>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  runEval: (taskId: string, mode?: 'mock' | 'simulate') => Promise<string>;
  refreshTasks: () => void;
  refreshSuites: () => void;
  refreshDashboard: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ==================== Mock Data (fallback) ====================
const mockDashboard: DashboardMetrics = {
  totalTasks: 0,
  avgPassRate: 0,
  avgLatency: 0,
  totalRuns: 0,
  capabilityEvals: 0,
  regressionEvals: 0,
  passRateTrend: [],
  latencyTrend: [],
};

// ==================== Provider ====================
export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedTask, setSelectedTask] = useState<EvalTask | null>(null);
  const [selectedRun, setSelectedRun] = useState<EvalRun | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Fetch tasks
  const { data: tasksData, isLoading: isLoadingTasks, mutate: mutateTasks } = useSWR<EvalTask[]>(
    '/api/tasks',
    fetcher,
    { fallbackData: [] }
  );

  // Fetch suites
  const { data: suitesData, isLoading: isLoadingSuites, mutate: mutateSuites } = useSWR<EvalSuite[]>(
    '/api/suites',
    fetcher,
    { fallbackData: [] }
  );

  // Fetch dashboard
  const { data: dashboardData, isLoading: isLoadingDashboard, mutate: mutateDashboard } = useSWR(
    '/api/analytics/dashboard',
    fetcher,
    { fallbackData: mockDashboard }
  );

  // Fetch trends
  const { data: passRateTrend } = useSWR('/api/analytics/trend', fetcher, { fallbackData: [] });
  const { data: latencyTrend } = useSWR('/api/analytics/latency', fetcher, { fallbackData: [] });

  // Actions
  const createTask = useCallback(async (taskData: Omit<EvalTask, 'id' | 'status' | 'passRate' | 'avgLatency' | 'lastRun' | 'trials'>) => {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    if (!response.ok) throw new Error('Failed to create task');
    mutateTasks();
    mutateDashboard();
  }, [mutateTasks, mutateDashboard]);

  const deleteTask = useCallback(async (id: string) => {
    const response = await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete task');
    mutateTasks();
    mutateDashboard();
  }, [mutateTasks, mutateDashboard]);

  const runEval = useCallback(async (taskId: string, mode: 'mock' | 'simulate' = 'mock') => {
    const response = await fetch('/api/eval/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, mode }),
    });
    if (!response.ok) throw new Error('Failed to start evaluation');
    const data = await response.json();
    mutateDashboard();
    return data.runId;
  }, [mutateDashboard]);

  // Combine dashboard with trends
  const dashboard: DashboardMetrics = {
    ...(dashboardData || mockDashboard),
    passRateTrend: passRateTrend || [],
    latencyTrend: latencyTrend || [],
  };

  // Transform tasks to match expected format
  const tasks: EvalTask[] = (tasksData || []).map(task => ({
    ...task,
    status: task.status || 'pending',
    passRate: task.passRate || 0,
    avgLatency: task.avgLatency || 0,
    lastRun: task.lastRun || 'N/A',
    trials: task.trials || 0,
  }));

  // Transform suites
  const suites: EvalSuite[] = dashboardData?.suites || suitesData || [];

  return (
    <AppContext.Provider value={{
      tasks,
      suites,
      runs: [],
      dashboard,
      isLoadingTasks,
      isLoadingSuites,
      isLoadingDashboard,
      selectedTask,
      selectedRun,
      setSelectedTask,
      setSelectedRun,
      currentPage,
      setCurrentPage,
      createTask,
      deleteTask,
      runEval,
      refreshTasks: () => mutateTasks(),
      refreshSuites: () => mutateSuites(),
      refreshDashboard: () => mutateDashboard(),
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
