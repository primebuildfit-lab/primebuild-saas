import { useState } from "react";
import { Card, ChipRow, Chip, DateBadge, Pill, Row, ScreenHeader, Segmented, PreviewTag } from "../ui";
import { IconShield, IconTag } from "../ui/icons";
import { EmptyState } from "../ui";
import { isoDay, isoMonthShort } from "../lib/date";
import { PREVIEW_OFFERS } from "../data/preview";

/**
 * Ofertas verificadas — verified deals. Two states in one screen so the design is
 * visible without faking a live feed: a "Verificadas" preview (clearly tagged) and
 * the honest empty state shown until a real, source-verified deal exists.
 */
export function OffersScreen() {
  const [tab, setTab] = useState<"verificadas" | "guardadas">("verificadas");

  return (
    <div className="em-fade-in">
      <ScreenHeader title="Ofertas verificadas" sub="Descuentos reales, confirmados contra su fuente." />

      <div style={{ marginBottom: 14 }}>
        <Segmented
          ariaLabel="Filtro de ofertas"
          value={tab}
          onChange={setTab}
          options={[
            { value: "verificadas", label: "Verificadas" },
            { value: "guardadas", label: "Guardadas" },
          ]}
        />
      </div>

      {tab === "verificadas" ? (
        <>
          <div style={{ marginBottom: 12 }}>
            <ChipRow>
              <Chip active>Todas</Chip>
              <Chip>Gastronomía</Chip>
              <Chip>Ocio</Chip>
              <Chip>Arte</Chip>
            </ChipRow>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 2px 10px" }}>
            <span style={{ fontSize: 12.5, color: "var(--em-text-muted)" }}>
              Así se verán las ofertas confirmadas
            </span>
            <span style={{ marginLeft: "auto" }}><PreviewTag /></span>
          </div>
          <Card>
            {PREVIEW_OFFERS.map((o) => (
              <Row
                key={o.id}
                leading={<DateBadge day={isoDay(o.verifiedOn)} month={isoMonthShort(o.verifiedOn)} brand />}
                title={o.title}
                sub={`${o.merchant} · ${o.category}`}
                trailing={
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Pill tone="ok"><IconShield size={13} /> Verificada</Pill>
                    <strong style={{ fontSize: 15 }}>{o.discount}</strong>
                  </span>
                }
                chevron={false}
              />
            ))}
          </Card>
          <p style={{ fontSize: 11.5, color: "var(--em-text-faint)", margin: "12px 4px 0" }}>
            Contenido de muestra para el diseño. Las ofertas reales aparecerán aquí cuando un comercio
            publique una oferta verificada contra su fuente.
          </p>
        </>
      ) : (
        <EmptyState
          icon={<IconTag />}
          title="No has guardado ofertas"
          sub="Guarda una oferta verificada para acceder a ella rápidamente."
        />
      )}
    </div>
  );
}
