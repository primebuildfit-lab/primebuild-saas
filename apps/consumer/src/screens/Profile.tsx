import { CONSUMER_PRODUCTS, CONSUMER_ADDONS } from "@eventra/config";
import { Avatar, Button, Card, Pill, ScreenHeader } from "../ui";
import { IconSparkle, IconShield, IconExternal } from "../ui/icons";
import { openAllowedWeb, businessClientUrl, MOBILE_LINKS } from "../openExternal";
import { UpdatePanel } from "../UpdatePanel";

/**
 * Tu cuenta — plan, upgrades and legal links. Business logic is UNCHANGED: plan
 * copy, product/add-on prices and the allow-listed external links all come from
 * the same sources as before (@eventra/config + openExternal). Only the visuals
 * were redesigned. Payments remain non-wired (this is the app structure).
 */
export function ProfileScreen() {
  const di = CONSUMER_PRODUCTS["consumer.deal_intelligence"];
  const adFree = CONSUMER_ADDONS["addon.ad_free"];

  return (
    <div className="em-fade-in">
      <ScreenHeader title="Tu cuenta" sub="Plan, avisos y preferencias." />

      {/* Identity + current plan */}
      <Card pad style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        <Avatar initials="TÚ" large />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 750 }}>Invitado</div>
          <div style={{ fontSize: 12.5, color: "var(--em-text-muted)", marginTop: 2 }}>
            Calendario + ofertas, con anuncios.
          </div>
        </div>
        <Pill tone="muted">Plan Gratis</Pill>
      </Card>

      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--em-text-faint)", margin: "16px 4px 10px", fontWeight: 700 }}>
        Mejoras
      </div>

      <UpgradeCard
        icon={<IconSparkle size={18} />}
        name={di.label}
        price={di.priceMonthly}
        desc="Alertas de ofertas verificadas, sin límites de seguimiento."
      />
      <UpgradeCard
        icon={<IconShield size={18} />}
        name={adFree.label}
        price={adFree.priceMonthly}
        desc="Quita los anuncios de la app."
      />

      <p style={{ fontSize: 11.5, color: "var(--em-text-faint)", margin: "12px 4px 0" }}>
        Los pagos no están conectados en esta vista — es la estructura de la app.
      </p>

      {/* Official Tauri auto-updater surface. Renders only in the desktop shell
          when an update channel is configured. */}
      <UpdatePanel />

      <LegalFooter />
    </div>
  );
}

function UpgradeCard({
  icon,
  name,
  price,
  desc,
}: {
  icon: React.ReactNode;
  name: string;
  price: number;
  desc: string;
}) {
  return (
    <Card style={{ marginBottom: 10 }}>
      <div className="em-upgrade">
        <span className="em-empty-icon" style={{ width: 44, height: 44, marginBottom: 0 }}>{icon}</span>
        <div className="em-upgrade-body">
          <div style={{ fontWeight: 700, fontSize: 14.5 }}>{name}</div>
          <div style={{ fontSize: 12.5, color: "var(--em-text-muted)", marginTop: 2 }}>{desc}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="em-upgrade-price">${price}<span>/mes</span></div>
          <Button size="sm" style={{ marginTop: 6 }}>Activar</Button>
        </div>
      </div>
    </Card>
  );
}

/**
 * Legal / support footer — the ONLY external links in Mobile. All are allow-listed
 * HTTPS pages (opened in the browser); none launch an internal-tool app. The
 * Business link only appears when a real, validated URL is configured. Logic is
 * unchanged from the original.
 */
function LegalFooter() {
  const client = businessClientUrl();
  const links: { label: string; url: string }[] = [
    { label: "Términos", url: MOBILE_LINKS.terms },
    { label: "Privacidad", url: MOBILE_LINKS.privacy },
    { label: "Soporte", url: MOBILE_LINKS.support },
    { label: "Web oficial", url: MOBILE_LINKS.web },
    ...(client ? [{ label: "Eventra Business", url: client }] : []),
  ];
  return (
    <div style={{ marginTop: 22, borderTop: "1px solid var(--em-border)", paddingTop: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {links.map((l) => (
          <button
            key={l.label}
            type="button"
            className="em-chip"
            onClick={() => void openAllowedWeb(l.url)}
          >
            {l.label} <IconExternal size={13} />
          </button>
        ))}
      </div>
      <p style={{ fontSize: 11, color: "var(--em-text-faint)", margin: "12px 4px 0" }}>
        Enlaces oficiales de Eventra (se abren en el navegador). Esta app no abre herramientas internas.
      </p>
    </div>
  );
}
