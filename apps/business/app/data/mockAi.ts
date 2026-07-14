import { DEMO_STORE_ID } from "./mockStore";

/**
 * AI module mock (Business UI reorg). Surfaces the AI *architecture* — models,
 * prompts, tasks, cost, accuracy — WITHOUT connecting a real model (CLAUDE.md §2,
 * spec: "No conectar IA real. Solo arquitectura."). Typed mock under app/data.
 */
export interface AiModel {
  id: string;
  name: string;
  provider: string;
  purpose: string;
  status: "available" | "default" | "disabled";
  /** cost per 1k tokens, USD (display only) */
  costPer1k: number;
  accuracy: number; // 0–100 (measured on internal evals)
}

export const aiModels: AiModel[] = [
  {
    id: "model_copy",
    name: "Copy Generator",
    provider: "Eventra AI",
    purpose: "Campaign copy, emails, captions",
    status: "default",
    costPer1k: 0.002,
    accuracy: 92,
  },
  {
    id: "model_score",
    name: "Opportunity Scorer",
    provider: "Eventra AI",
    purpose: "Rank and explain opportunities",
    status: "available",
    costPer1k: 0.001,
    accuracy: 88,
  },
  {
    id: "model_vision",
    name: "Creative Vision",
    provider: "Eventra AI",
    purpose: "Image tagging & suggestions",
    status: "disabled",
    costPer1k: 0.004,
    accuracy: 81,
  },
];

export interface AiPrompt {
  id: string;
  name: string;
  modelId: string;
  version: number;
  updatedAt: string; // ISO
}

export const aiPrompts: AiPrompt[] = [
  { id: "prm_email", name: "Launch email", modelId: "model_copy", version: 4, updatedAt: "2026-07-11T14:00:00Z" },
  { id: "prm_caption", name: "Social captions", modelId: "model_copy", version: 2, updatedAt: "2026-07-12T16:00:00Z" },
  { id: "prm_explain", name: "Opportunity rationale", modelId: "model_score", version: 3, updatedAt: "2026-07-09T10:00:00Z" },
];

export type AiTaskStatus = "queued" | "running" | "done" | "error";

export interface AiTask {
  id: string;
  label: string;
  modelId: string;
  status: AiTaskStatus;
  tokens: number;
  costUsd: number;
  createdAt: string; // ISO
}

export const aiTasks: AiTask[] = [
  { id: "ai_1", label: "Black Friday launch email", modelId: "model_copy", status: "done", tokens: 1800, costUsd: 0.0036, createdAt: "2026-07-11T14:30:00Z" },
  { id: "ai_2", label: "Halloween social captions", modelId: "model_copy", status: "running", tokens: 400, costUsd: 0.0008, createdAt: "2026-07-12T16:00:00Z" },
  { id: "ai_3", label: "Score refresh — 11 opportunities", modelId: "model_score", status: "done", tokens: 2200, costUsd: 0.0022, createdAt: "2026-07-13T06:00:00Z" },
  { id: "ai_4", label: "Summer bundle copy", modelId: "model_copy", status: "error", tokens: 0, costUsd: 0, createdAt: "2026-07-10T09:00:00Z" },
];

export const aiUsage = {
  storeId: DEMO_STORE_ID,
  periodLabel: "July 2026",
  tasksRun: aiTasks.length,
  tokensUsed: aiTasks.reduce((s, t) => s + t.tokens, 0),
  costUsd: aiTasks.reduce((s, t) => s + t.costUsd, 0),
  /** monthly AI task allowance from the plan (display only) */
  monthlyAllowance: 500,
};
