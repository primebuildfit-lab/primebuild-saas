# Eventra Internal OS — Desktop Security

> Scope: security posture of the **desktop packaging only**. It does not change
> Eventra's authentication, authorization, RLS, Supabase, or backend security —
> those remain exactly as in the web console.

## 1. Principle: least privilege

Tauri's security model gates what **web content can ask the Rust core to do**
via *capabilities* and *permissions*. The Eventra Internal OS shell exposes the
**minimum**:

`src-tauri/capabilities/default.json`
```json
{
  "identifier": "default",
  "windows": ["main"],
  "permissions": ["core:default"]
}
```

- Only `core:default` is granted (safe window/event primitives).
- **No** filesystem, shell, process, arbitrary-HTTP, or dialog IPC is exposed to
  web content.
- Window persistence, local logging and external-link opening are implemented
  **entirely in Rust**, so no additional IPC surface is handed to the frontend.

## 2. No secrets in the desktop layer

- The admin frontend is a client SPA that already holds **no secrets**
  (`apps/admin/.env.example` documents only `VITE_*` public values).
- Supabase service-role keys, Shopify secrets and Railway credentials live in
  server/service environments and are **never** bundled into the desktop app.
- The desktop build embeds only the same public static assets the web build
  produces.

## 3. Authentication is unchanged

- The desktop app loads the same frontend and uses the same auth flow. Being
  "installed" grants **no** privilege: it does not bypass login, does not elevate
  any Windows user to an Eventra admin, and does not persist credentials outside
  the normal WebView2 session storage.
- The Internal OS remains **deny-by-default**: access requires an Eventra
  platform admin principal, exactly as in the web app. (In the current
  foundation build this boundary is mocked in-frontend; the desktop layer does
  not alter it.)

## 4. External links

- External navigation is restricted to an **allowlist** of trusted Eventra hosts
  and opened in the user's **default system browser**, never inside the app's
  privileged WebView. Allowlisted host suffixes:
  `eventra.app`, `shopify.com`, `myshopify.com`, `railway.app`, `supabase.com`,
  `supabase.co`, `github.com`.
- Arbitrary external sites are **not** loaded inside the main window.

## 5. Local logs contain no sensitive data

- Logs are written to the per-user app log directory (see the installation doc).
- Logged: startup, shutdown, version, window-ready, external-link decisions,
  errors.
- **Never** logged: passwords, tokens, cookies, Supabase/Shopify/Railway keys,
  or request/response bodies.

## 6. Installer & distribution

- NSIS installs **per-user** (`currentUser`) — no admin elevation required.
- The build is **not** code-signed for this pilot. Windows SmartScreen will show
  `Unknown publisher`; this is expected and acceptable for private internal
  distribution. No insecure workaround is used to bypass SmartScreen.
- No auto-updater endpoint is configured, so there is no update channel to
  secure yet (see the build doc for the future updater plan).

## 7. Content Security Policy

- CSP is currently `null` (unset) so the app can reach the same external Eventra
  services the web console uses without breakage during the pilot. Tightening CSP
  to an explicit `connect-src` allowlist of Supabase/Railway origins is a
  recommended hardening follow-up once the live API base URL is wired.
