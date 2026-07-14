import {
  PageHeader,
  StatTile,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  DataTable,
  type BadgeTone,
  type Column,
} from "~/components/ui";
import { BrainCircuit, Sparkles, DollarSign, Gauge } from "lucide-react";
import {
  aiModels,
  aiPrompts,
  aiTasks,
  aiUsage,
  type AiModel,
  type AiTask,
  type AiTaskStatus,
} from "~/data";
import { formatDate } from "~/lib/dates";
import { humanizeCategory } from "~/lib/format";

const MODEL_STATUS_TONE: Record<AiModel["status"], BadgeTone> = {
  default: "brand",
  available: "green",
  disabled: "gray",
};
const TASK_STATUS_TONE: Record<AiTaskStatus, BadgeTone> = {
  queued: "gray",
  running: "blue",
  done: "green",
  error: "red",
};

function modelName(id: string): string {
  return aiModels.find((m) => m.id === id)?.name ?? id;
}

export default function AiRoute() {
  const modelColumns: Column<AiModel>[] = [
    {
      key: "name",
      header: "Model",
      cell: (m) => (
        <div>
          <div className="font-medium text-ink">{m.name}</div>
          <div className="text-xs text-ink-muted">{m.purpose}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (m) => <Badge tone={MODEL_STATUS_TONE[m.status]}>{humanizeCategory(m.status)}</Badge>,
    },
    {
      key: "accuracy",
      header: "Accuracy",
      align: "right",
      hideOnMobile: true,
      cell: (m) => <span className="tabular-nums text-ink">{m.accuracy}%</span>,
    },
    {
      key: "cost",
      header: "Cost / 1k",
      align: "right",
      cell: (m) => <span className="tabular-nums text-ink-muted">${m.costPer1k.toFixed(3)}</span>,
    },
  ];

  const taskColumns: Column<AiTask>[] = [
    {
      key: "label",
      header: "Task",
      cell: (t) => (
        <div>
          <div className="font-medium text-ink">{t.label}</div>
          <div className="text-xs text-ink-muted">{modelName(t.modelId)}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (t) => <Badge tone={TASK_STATUS_TONE[t.status]}>{humanizeCategory(t.status)}</Badge>,
    },
    {
      key: "tokens",
      header: "Tokens",
      align: "right",
      hideOnMobile: true,
      cell: (t) => <span className="tabular-nums text-ink-muted">{t.tokens.toLocaleString()}</span>,
    },
    {
      key: "cost",
      header: "Cost",
      align: "right",
      cell: (t) => <span className="tabular-nums text-ink-muted">${t.costUsd.toFixed(4)}</span>,
    },
    {
      key: "created",
      header: "Created",
      align: "right",
      hideOnMobile: true,
      cell: (t) => <span className="text-sm text-ink-muted">{formatDate(t.createdAt.slice(0, 10))}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="AI"
        description="Eventra's AI workbench — models, prompts, tasks, cost, and accuracy. Architecture only; no live model is connected in V1."
      />

      <div className="mb-4 flex items-start gap-2 rounded-lg border border-sky-500/30 bg-sky-500/15 px-4 py-2 text-sm text-sky-200">
        <span aria-hidden>ℹ️</span>
        <span>
          <strong>Preview architecture.</strong> These figures show how the AI module is structured; no real model runs against your store yet.
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Models" value={aiModels.length} icon={BrainCircuit} />
        <StatTile label="Tasks run" value={aiUsage.tasksRun} icon={Sparkles} hint={aiUsage.periodLabel} />
        <StatTile label="Spend" value={`$${aiUsage.costUsd.toFixed(2)}`} icon={DollarSign} />
        <StatTile
          label="Usage"
          value={`${aiUsage.tasksRun}/${aiUsage.monthlyAllowance}`}
          icon={Gauge}
          hint="Monthly task allowance"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <h2 className="mb-2 text-sm font-semibold text-ink">Models</h2>
            <DataTable columns={modelColumns} rows={aiModels} rowKey={(m) => m.id} />
          </div>
          <div>
            <h2 className="mb-2 text-sm font-semibold text-ink">Recent tasks</h2>
            <DataTable columns={taskColumns} rows={aiTasks} rowKey={(t) => t.id} />
          </div>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Prompts &amp; versions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiPrompts.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-ink">{p.name}</div>
                  <div className="text-xs text-ink-muted">{modelName(p.modelId)}</div>
                </div>
                <Badge tone="gray">v{p.version}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
