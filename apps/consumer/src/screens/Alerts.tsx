import { Card, EmptyState, Row, ScreenHeader, Pill, Button } from "../ui";
import { IconInbox, IconBell, IconSparkle } from "../ui/icons";

/**
 * Alertas — the notifications inbox. Honest by design: no fabricated alerts.
 * The screen shows the redesigned empty state plus a preview of what an alert
 * card looks like once Deal Intelligence is active, so the layout is verifiable
 * without pretending alerts already exist.
 */
export function AlertsScreen() {
  return (
    <div className="em-fade-in">
      <ScreenHeader title="Alertas" sub="Te avisamos de las ofertas verificadas que te importan." />

      <EmptyState
        icon={<IconInbox />}
        title="Sin alertas por ahora"
        sub="Activa Deal Intelligence para recibir avisos de ofertas verificadas antes que nadie."
        action={<Button size="sm"><IconSparkle size={16} /> Activar Deal Intelligence</Button>}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "22px 2px 10px" }}>
        <h2 className="em-section-title" style={{ fontSize: 15 }}>Así se verá una alerta</h2>
        <span className="em-preview-tag" style={{ marginLeft: "auto" }}>Ejemplo</span>
      </div>
      <Card style={{ opacity: 0.85 }}>
        <Row
          leading={
            <span className="em-empty-icon" style={{ width: 44, height: 44, marginBottom: 0 }}>
              <IconBell size={20} />
            </span>
          }
          title="Nueva oferta verificada cerca de ti"
          sub="Cines Aurora · 2x1 en entradas · a 900 m"
          trailing={<Pill tone="brand" dot>Nueva</Pill>}
          chevron={false}
        />
      </Card>
    </div>
  );
}
