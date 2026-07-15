# Eventra Internal OS — Windows Installation

> Private internal pilot. Windows 10/11 x64.

## 1. Prerequisites (end user)

- Windows 10/11 (x64).
- **Microsoft Edge WebView2 Runtime** — preinstalled on current Windows 11. If
  missing, the NSIS installer offers to download it automatically.
- No admin rights required: the app installs **per-user**.

## 2. Install

1. Obtain the installer (see `EVENTRA_ADMIN_DESKTOP_BUILD.md` for the exact
   output path). Either:
   - `Eventra Internal OS_<version>_x64-setup.exe` (NSIS), or
   - `Eventra Internal OS_<version>_x64_en-US.msi` (MSI).
2. Run it. Windows SmartScreen may show **"Unknown publisher"** (the pilot is not
   code-signed) — choose **More info → Run anyway**.
3. Follow the wizard. The app installs to the per-user location and creates:
   - a **Start Menu** entry ("Eventra Internal OS"),
   - an optional **Desktop** shortcut,
   - a registered **uninstaller** (Apps & features / Add-remove programs).

## 3. First launch

- Launch from the Start Menu or desktop shortcut.
- The window opens centered at 1500 × 950 and shows the Internal OS dashboard —
  identical to the web console.
- Log in with your Eventra platform admin credentials (same as the web app).
  Being installed grants no automatic access.

## 4. Window behavior

- Resizable (minimum 1100 × 700), maximizable.
- Size, position and maximized state are **remembered** between runs.

## 5. Data & session

- No local database is created. The app connects to the **same** Eventra
  services (Supabase / Railway) as the web console. Your session is stored in the
  app's WebView storage and persists across restarts until logout/expiry.

## 6. Logs

- Location (per user):
  `%APPDATA%\com.eventra.internal\logs\`
  (and/or `%LOCALAPPDATA%\com.eventra.internal\logs\`).
- File: `eventra-internal-os.log`. Contains startup/shutdown/version/errors only
  — **no** passwords, tokens or secrets.

## 7. Update (pilot)

- Manual: uninstall or run a newer installer over the top. User data/settings in
  `%APPDATA%\com.eventra.internal\` are preserved across reinstalls; the
  uninstaller does not delete them without confirmation.

## 8. Uninstall

- **Settings → Apps → Installed apps → Eventra Internal OS → Uninstall**, or run
  the registered uninstaller. This removes the program and shortcuts.
