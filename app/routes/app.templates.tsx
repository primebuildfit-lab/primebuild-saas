import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Plus,
  LayoutTemplate,
  Trash2,
  Clock,
  Tag,
  Sparkles,
} from "lucide-react";
import {
  PageHeader,
  Button,
  Card,
  CardContent,
  Badge,
  EmptyState,
  ConfirmDialog,
} from "~/components/ui";
import { useData } from "~/context/DataContext";
import { templateToCampaignInput } from "~/lib/campaigns";
import { CategoryBadge } from "~/features/events/eventDisplay";
import { TemplateFormModal } from "~/features/templates/TemplateFormModal";

export default function TemplatesRoute() {
  const { templates, deleteTemplate, createCampaign } = useData();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const useTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    const campaign = createCampaign(templateToCampaignInput(template));
    navigate(`/app/campaigns?c=${campaign.id}`);
  };

  const pending = templates.find((t) => t.id === confirmId);

  return (
    <div>
      <PageHeader
        title="Templates"
        description="Reusable campaign structures. Duplicate one to start a new campaign fast."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New template
          </Button>
        }
      />

      {templates.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title="No templates yet"
          description="Save a campaign as a template, or create one from scratch, to reuse its structure."
          action={<Button onClick={() => setCreateOpen(true)}>Create template</Button>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <Card key={t.id}>
              <CardContent className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-gray-900">{t.name}</h3>
                  <CategoryBadge category={t.category} />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-gray-500">
                  <Badge tone="gray">
                    <Clock className="h-3 w-3" />
                    {t.defaultDurationDays}-day run
                  </Badge>
                  <Badge tone="gray">{t.defaultLeadDays}-day lead</Badge>
                  {t.offer ? (
                    <Badge tone="green">
                      <Tag className="h-3 w-3" />
                      {t.offer}
                    </Badge>
                  ) : null}
                </div>
                {t.notes ? (
                  <p className="mt-2 line-clamp-2 text-xs text-gray-500">{t.notes}</p>
                ) : null}
                <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3">
                  <Button size="sm" onClick={() => useTemplate(t.id)}>
                    <Sparkles className="h-4 w-4" />
                    Use template
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmId(t.id)}
                    aria-label={`Delete ${t.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TemplateFormModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <ConfirmDialog
        open={Boolean(pending)}
        onClose={() => setConfirmId(null)}
        onConfirm={() => pending && deleteTemplate(pending.id)}
        title="Delete template"
        message={`Delete the "${pending?.name}" template? Campaigns already created from it are unaffected.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

export { RouteBoundary as ErrorBoundary } from "~/components/RouteBoundary";
