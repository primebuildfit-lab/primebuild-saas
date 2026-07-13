# Eventra — Mobile Installation Guide (`MOBILE_INSTALLATION_GUIDE.md`)

> How to install Eventra on a phone as a PWA. **The install link does not exist yet** — it is the public
> deploy URL, published only after Bloque 4. Until then, use `https://<eventra-host>/` as a placeholder.

## The link (after deploy)

```
https://<eventra-host>/            ← same public URL for browser + PWA install
```

Requirements already shipped (verified by `check:pwa`): `manifest.webmanifest`, service worker (`sw.js`),
`offline.html`, PNG icons **192 + 512** (`any maskable`) + `apple-touch-icon.png` (180), theme color
`#4f46e5`, `display: standalone`, `start_url: /app`, `scope: /`.

## Android (Chrome)
1. Open the public URL in Chrome.
2. Wait for the install prompt, or menu (⋮) → **Install app** / **Add to Home screen**.
3. Confirm. Open Eventra from the home-screen icon.
4. Verify: launches standalone (no browser chrome), navigation works, session persists, offline shows the
   offline shell (not a fake "saved"), and a new deploy updates on next launch.

## iPhone (Safari)
1. Open the public URL in **Safari** (iOS installs PWAs only from Safari).
2. Tap **Share** → **Add to Home Screen**.
3. Confirm the name/icon → **Add**.
4. Open from the home screen. Verify: standalone, session, navigation, offline shell.

## Notes
- Inside Shopify Admin the app runs embedded (App Bridge); the PWA is for standalone/web use of the same
  deploy. The service worker registers **only** in a top-level window (never inside the Shopify iframe).
- Private/authenticated responses (`/app/data`, `/auth`, `/webhooks`) are never cached.
- Physical install on a device has **not** been performed yet — it is a Brian step after deploy.
