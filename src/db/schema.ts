import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ==================== Tasks ====================
// 评测任务定义
export const tasks = sqliteTable('tasks', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    type: text('type', { enum: ['capability', 'regression'] }).notNull(),
    category: text('category').notNull(),
    systemPrompt: text('system_prompt'),
    checkpoints: text('checkpoints', { mode: 'json' }).$type<string[]>(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ==================== Suites ====================
// 评测套件（任务集合）
export const suites = sqliteTable('suites', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    taskIds: text('task_ids', { mode: 'json' }).$type<string[]>(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ==================== Runs ====================
// 评测运行记录
export const runs = sqliteTable('runs', {
    id: text('id').primaryKey(),
    taskId: text('task_id').notNull().references(() => tasks.id),
    suiteId: text('suite_id').references(() => suites.id),
    status: text('status', { enum: ['pending', 'running', 'passed', 'failed'] }).notNull(),
    startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
    endTime: integer('end_time', { mode: 'timestamp' }),
    // Metrics
    asrLatency: real('asr_latency'),
    llmTTF: real('llm_ttf'),
    ttsLatency: real('tts_latency'),
    e2eLatency: real('e2e_latency'),
    intentAccuracy: real('intent_accuracy'),
    taskCompletion: integer('task_completion', { mode: 'boolean' }),
    // Scores
    codeScore: real('code_score'),
    modelScore: real('model_score'),
    compositeScore: real('composite_score'),
});

// ==================== Transcripts ====================
// 对话轨迹
export const transcripts = sqliteTable('transcripts', {
    id: text('id').primaryKey(),
    runId: text('run_id').notNull().references(() => runs.id),
    turn: integer('turn').notNull(),
    role: text('role', { enum: ['user', 'agent', 'system'] }).notNull(),
    content: text('content').notNull(),
    timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
    audioUrl: text('audio_url'),
    // Turn-level metrics
    asrLatency: real('asr_latency'),
    llmLatency: real('llm_latency'),
    ttsLatency: real('tts_latency'),
    // Tool calls (JSON)
    toolCalls: text('tool_calls', { mode: 'json' }).$type<{
        name: string;
        params: Record<string, unknown>;
        result: string;
    }[]>(),
});

// ==================== Types ====================
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Suite = typeof suites.$inferSelect;
export type NewSuite = typeof suites.$inferInsert;
export type Run = typeof runs.$inferSelect;
export type NewRun = typeof runs.$inferInsert;
export type Transcript = typeof transcripts.$inferSelect;
export type NewTranscript = typeof transcripts.$inferInsert;
