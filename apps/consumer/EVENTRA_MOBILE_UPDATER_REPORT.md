# Eventra Mobile — Auto-Updater oficial de Tauri

**App:** Eventra Mobile (`apps/consumer`, `com.eventra.mobile`)
**Fecha:** 2026-07-18
**Alcance:** SOLO esta aplicación. No se modificó ninguna otra app del ecosistema.

---

## 1. Resumen

El updater oficial de Tauri 2 (`tauri-plugin-updater`) queda **completamente funcional
y el canal está VIVO en GitHub**. Verificado con una actualización real 0.1.0 → 0.2.0
sobre la app instalada, **descargando del endpoint público real por HTTPS**:
detección, verificación de firma, descarga, instalación, reinicio y conservación
de datos locales. El ciclo automático completo (tag → Actions → release publicado →
la app instalada se actualiza sola) está probado de extremo a extremo.

Canal: <https://github.com/primebuildfit-lab/primebuild-saas/releases/tag/eventra-mobile>
(tag rodante `eventra-mobile`, publicado con `--latest=false`).

No se creó ningún updater propio. Todo el mecanismo es el oficial de Tauri; lo
añadido es la capa de estado y la interfaz para el usuario.

| Requisito | Estado |
|---|---|
| Detectar nueva versión | ✅ verificado |
| Comprobar la firma | ✅ verificado (incl. rechazo de firma inválida) |
| Descargar la actualización | ✅ verificado |
| Mostrar progreso | ✅ implementado (barra + % + MB) |
| Permitir instalarla | ✅ acción explícita del usuario |
| Reiniciar correctamente | ✅ verificado (relanza en 0.2.0) |
| Conservar datos locales | ✅ verificado |
| Registrar errores | ✅ log local + estado en UI |
| Búsqueda automática al iniciar | ✅ verificado |
| Búsqueda manual | ✅ implementado |
| Mensaje claro "hay versión nueva" | ✅ implementado |
| Mensaje claro "estás al día" | ✅ implementado |

---

## 2. Configuración encontrada (auditoría previa)

Lo que **ya estaba bien** y se conservó:

- `tauri-plugin-updater` 2.10.1 correctamente declarado y **limitado a escritorio**
  (`[target.'cfg(not(any(target_os = "android", target_os = "ios")))'.dependencies]`),
  con el plugin registrado bajo `#[cfg(desktop)]`. En móvil actualiza la tienda.
- Estrategia de **dos configs**: `tauri.conf.json` con el centinela
  `REPLACE_WITH_PRODUCTION_PUBKEY`, y `tauri.conf.release.json` con la clave
  pública real + `createUpdaterArtifacts: true`. Las compilaciones locales quedan
  sin firmar y sin capacidad de actualizarse; solo release/CI produce artefactos
  firmados. **Diseño correcto — no se tocó el centinela.**
- Par de claves **coherente**: el contenido de `~/.eventra-keys/eventra-mobile.key.pub`
  coincide exactamente con `plugins.updater.pubkey` del overlay de release.
- Endpoint con **tag fijo** (`releases/download/eventra-mobile/latest-mobile.json`)
  en vez de `releases/latest`, para no colisionar con las demás apps del monorepo.
- Workflow `release-eventra-mobile.yml` que compila, firma, compone el manifiesto
  y publica el canal rodante con `--latest=false`. Correcto.
- `installMode: passive` para NSIS.
- Capabilities **sin permisos de updater**: el flujo vive en Rust, la webview
  nunca recibe esa superficie IPC.

### Problemas encontrados

| # | Problema | Gravedad | Resuelto |
|---|---|---|---|
| 1 | **Cero interfaz de usuario.** Todo el updater era silencioso: solo escribía en el log. No había forma de buscar manualmente, ni de ver progreso, ni de saber si había versión nueva o si ya estabas al día. | Alta | ✅ |
| 2 | **Instalación automática sin consentimiento.** El arranque descargaba e instalaba sola, reiniciando la app sin avisar. | Alta | ✅ |
| 3 | **Callback de progreso vacío** (`\|_chunk, _total\| {}`): el progreso se descartaba. | Alta | ✅ |
| 4 | **`app.restart()` inalcanzable en Windows.** `Update::install` lanza el instalador NSIS con `/UPDATE` y llama a `std::process::exit(0)`; el código posterior nunca se ejecuta. Era código muerto que sugería un reinicio que en realidad hace el instalador. | Media | ✅ |
| 5 | **`@tauri-apps/api` no declarado** en `apps/consumer/package.json`; funcionaba solo por hoisting del monorepo. | Media | ✅ |
| 6 | **`cargo test` no compilaba**: rustc agota memoria codificando metadatos con debuginfo completo (`STATUS_STACK_BUFFER_OVERRUN`). Los tests de Rust eran, en la práctica, inejecutables. | Media | ✅ |
| 7 | **Sin script local** para producir una build firmada; había que recordar el `--config` a mano. | Baja | ✅ |
| 8 | Log engañoso: decía "signature verified" al terminar la descarga, pero la verificación ocurre *después* de ese callback. | Baja | ✅ |

---

## 3. Cambios realizados

Todos dentro de `apps/consumer/`.

### `src-tauri/src/updater.rs` — reescrito

- **Máquina de estados** `UpdateState` serializada como unión etiquetada
  (`idle`, `notConfigured`, `checking`, `upToDate`, `available`, `downloading`,
  `installing`, `failed`). Cada transición se guarda y se emite a la webview en
  el evento `eventra://update-state`.
- **Progreso real**: el callback acumula bytes y calcula el porcentaje; solo
  emite cuando cambia el entero de porcentaje, para no inundar el canal IPC.
  Si el servidor no envía `content-length`, el estado lleva `percent: null` y la
  UI muestra barra indeterminada.
- **Tres comandos** expuestos a la UI: `updater_state`, `updater_check`,
  `updater_install`. Son comandos propios de la app, así que la webview sigue
  **sin** permisos del plugin updater: no puede descargar ni instalar por su
  cuenta, solo pedir y leer.
- **Detección de "no configurado"**: se lee la pubkey real del config embebido y
  se compara con el centinela. Una build sin clave informa `notConfigured` y la
  UI se oculta, en vez de ofrecer un botón que no puede funcionar.
- **Guarda de concurrencia** (`AtomicBool` + guard con `Drop`): dos comprobaciones
  simultáneas no se pisan, y un fallo no deja el updater bloqueado.
- **La política cambió**: el arranque **solo informa**. Instalar es una acción
  explícita del usuario. Se añadió `EVENTRA_UPDATE_AUTO_APPLY=1` para instalaciones
  desatendidas/kiosko — y es lo que permite ejecutar la prueba E2E automatizada.
- Se eliminó el `app.restart()` inalcanzable en Windows y se documentó que el
  relanzamiento lo hace NSIS con `/UPDATE`.
- 5 tests unitarios que fijan el contrato de serialización con la UI y verifican
  que el config base lleva el centinela y el overlay la clave real.

### `src-tauri/src/lib.rs`

- Registro del estado (`.manage`) y de los tres comandos, todo bajo `#[cfg(desktop)]`.

### `src/updater.ts` (nuevo)

Cliente tipado del updater. Espeja la unión de Rust, importa `@tauri-apps/api`
dinámicamente y **degrada a `unsupported`** fuera del shell de escritorio, para
que la build web/PWA no se rompa ni muestre controles inútiles. Incluye los
textos en español de cada fase.

### `src/UpdatePanel.tsx` (nuevo)

Panel "Actualizaciones" en la pestaña **Cuenta**:

- versión actual, y píldora **"Nueva"** / **"Al día"**;
- una línea de estado honesta por fase (`role="status"`, `aria-live="polite"`);
- notas de la versión cuando el manifiesto las trae;
- **barra de progreso** determinada o indeterminada (`role="progressbar"`);
- botones **"Descargar e instalar"** y **"Buscar actualizaciones"**, deshabilitados
  mientras hay trabajo en curso;
- nota fija de que todo se verifica por firma y que los datos locales se conservan.

No se renderiza nada si la app corre en navegador o si la build no tiene canal.

### `src/App.tsx`

Punto indicador en la pestaña **Cuenta** cuando hay versión nueva, con etiqueta
accesible `"Cuenta — actualización disponible"`.

### Configuración

- `package.json`: `@tauri-apps/api` declarado; nuevo script
  **`desktop:build:release`** (build firmada con el overlay).
- `Cargo.toml`: `[profile.test] debug = 0`, que hace `cargo test` ejecutable.

### Tests

- `test/updater.test.tsx` (nuevo, 14 casos): falsea el límite IPC de Tauri y
  comprueba cada fase, el progreso, el badge, la degradación en web y que el
  panel se oculta sin canal configurado.
- 5 tests de Rust en `updater.rs`.

---

## 4. Pruebas realizadas

| Prueba | Resultado |
|---|---|
| `npm run typecheck` (monorepo) | ✅ sin errores |
| `npm run lint` (monorepo) | ✅ 0 errores (8 avisos preexistentes en otras apps) |
| `npm run test` (monorepo) | ✅ **687 tests** en 66 ficheros |
| `npm run test --workspace @eventra/consumer` | ✅ 20/20 |
| `cargo check --all-targets` | ✅ |
| `cargo clippy --all-targets -- -D warnings` | ✅ sin avisos |
| `cargo test` | ✅ 5/5 |
| `tauri build` firmado (0.1.0 y 0.2.0) | ✅ NSIS + MSI + `.sig` |
| Instalador NSIS instalado en Windows 11 | ✅ |

### Prueba real de actualización 0.1.0 → 0.2.0

Se compilaron y **firmaron con la clave de producción** dos versiones distintas,
se instaló la 0.1.0, y se sirvió un manifiesto firmado en `127.0.0.1` apuntado con
`EVENTRA_UPDATE_ENDPOINT`.

Log de la app instalada (íntegro):

```
[19:39:29] Eventra Mobile starting — v0.1.0
[19:39:29] updater: version 0.2.0 available (current 0.1.0)
[19:39:29] updater: downloading 0.2.0
[19:39:29] updater: download complete — verifying signature
[19:39:29] updater: installing 0.2.0 — the app will relaunch
[19:39:29] updater: exiting to hand off to the installer
[19:39:35] Eventra Mobile starting — v0.2.0      <-- relanzada sola
```

`eventra-mobile.exe` pasó de **0.1.0 a 0.2.0** en disco. Verificado además:

- **Datos conservados**: un fichero marcador en `%APPDATA%\com.eventra.mobile`,
  el `.window-state.json` (geometría de ventana) y el almacenamiento de la
  webview (`EBWebView/Default`) sobrevivieron intactos a la actualización.
- **Rechazo de firma inválida**: con un manifiesto que anuncia 0.2.0 pero lleva
  la firma del instalador 0.1.0, la app registra
  `download/verify failed: The signature verification failed`, **no instala**,
  se queda en 0.1.0 y sigue funcionando. Este es el rollback efectivo: un paquete
  manipulado nunca llega a tocar la instalación.
- **HTTPS obligatorio**: la build de producción **rechaza** endpoints `http://`
  (`must use a secure protocol like https`). Se confirmó ejecutando la build
  instalada final contra el servidor local: la rechaza.

**Nota de honestidad sobre el método:** como Tauri prohíbe `http://` en release,
la build *de partida* (0.1.0) se compiló con `dangerousInsecureTransportProtocol`
pasado **en línea por CLI, nunca escrito en el repositorio**, para poder servir el
manifiesto en localhost sin tocar el almacén de certificados de confianza de
Windows. El **paquete de actualización (0.2.0) es la build real y limpia**, y la
verificación de firma se hizo contra la **clave pública de producción**. Al
terminar se reinstaló la build limpia 0.1.0 y se comprobó por comportamiento que
la app instalada rechaza `http` — es decir, la máquina queda con la build de
producción, no con la de prueba.

### Publicación del canal y verificación contra GitHub (2026-07-19)

**Rotación de clave previa (obligatoria).** El secreto `TAURI_SIGNING_PRIVATE_KEY`
del repositorio nunca fue una clave minisign válida — el primer intento de release
compiló los instaladores y murió al firmar con
`failed to decode base64 secret key: Invalid symbol 45, offset 3`. Además la clave
local `EC5D8237EC56364B` quedó expuesta durante la sesión de implementación. Se
generó un par nuevo **`3D29A4957B5C8FFE`** (sin contraseña), se cargó la privada en
el secreto y se commiteó solo la pública. No había ningún release publicado con la
clave vieja, así que ninguna instalación quedó huérfana.

**Ciclo automático probado.** `git tag eventra-mobile-v0.2.0 && git push` →
Actions run `29686214568` en verde → el workflow compiló, firmó, compuso
`latest-mobile.json` y publicó el canal con el instalador. Manifiesto servido por
HTTPS y descargable **sin credenciales** (el repositorio es público; con un repo
privado el updater no podría descargar, porque baja sin autenticar).

**Actualización real desde GitHub**, sobre la app instalada y **sin ninguna variable
de endpoint** (solo el modo desatendido para automatizar la prueba):

```
[12:13:46] Eventra Mobile starting — v0.1.0
[12:13:46] updater: version 0.2.0 available (current 0.1.0)
[12:13:46] updater: downloading 0.2.0
[12:13:46] updater: download complete — verifying signature
[12:13:46] updater: signature verified for 0.2.0
[12:13:46] updater: installing 0.2.0 — the app will relaunch
[12:13:51] Eventra Mobile starting — v0.2.0          <-- relanzada sola
[12:13:51] updater: Eventra Mobile is up to date (v0.2.0)
```

La última línea es la confirmación de que la 0.2.0 instalada consulta el canal real
por su cuenta y responde correctamente "al día". Datos locales conservados
(marcador en `%APPDATA%`, `.window-state.json` y `EBWebView/Default` intactos).

---

## 5. Resultado final

El updater oficial de Tauri queda operativo de extremo a extremo en Eventra Mobile,
**con el canal publicado y funcionando**. No queda ningún paso pendiente: a partir de
ahora cada versión que se etiquete llega sola a las instalaciones existentes.

Estado de la máquina al terminar: **Eventra Mobile 0.2.0 instalada**, actualizada
por el propio updater desde GitHub, sin ficheros de prueba. Repo en `0.2.0`,
árbol limpio.

Nada fuera de `apps/consumer/` fue modificado.

---

## 6. Para publicar una versión (procedimiento)

El secreto `TAURI_SIGNING_PRIVATE_KEY` **ya está cargado** con la clave
`3D29A4957B5C8FFE`. No hay pasos manuales previos. Para cada versión:

1. Subir `version` en `src-tauri/tauri.conf.json` **y** en `src-tauri/Cargo.toml`.
2. `git commit && git tag eventra-mobile-vX.Y.Z && git push origin eventra-mobile-vX.Y.Z`.

⚠️ **La clave privada existe únicamente en `~/.eventra-keys/eventra-mobile.key` y en
el secreto del repositorio. Haz una copia de seguridad**: si se pierde, ninguna
instalación existente podrá volver a actualizarse (habría que redistribuir la app a
mano con una clave nueva).

El workflow compila, firma, publica el canal `eventra-mobile` con el instalador y
`latest-mobile.json`, y las instalaciones existentes lo detectan al siguiente
arranque.

---

## 7. Posibles mejoras

Ordenadas por valor:

1. **Copia de seguridad de la clave de firma** (ver §6). Es hoy el único punto
   de fallo irrecuperable del canal.
2. **Distinguir "canal inaccesible" de "error real"** en la UI. Hoy, si el release
   aún no existe, el usuario ve un mensaje en rojo. Un fallo de red en la
   comprobación *automática* podría mostrarse en tono neutro y reservar el rojo
   para la comprobación *manual*.
3. **`apps/consumer` no tiene script `lint`**, así que el `npm run lint` de la raíz
   lo salta por completo. Añadir ESLint a esta app la pondría al nivel de las demás.
4. **Comprobación periódica**, no solo al arrancar (p. ej. cada 6 h), útil para
   sesiones largas.
5. **Notas de versión desde el CHANGELOG** en el manifiesto: hoy el workflow genera
   un texto genérico; la UI ya sabe mostrar `notes`.
6. **Firmar el ejecutable con certificado Authenticode** (aparte de minisign) para
   evitar el aviso SmartScreen de Windows en la primera instalación.

---

## 8. Hallazgos que afectan a TODO el ecosistema (documentados, NO modificados)

Detectados de pasada. **No se tocó ninguna otra aplicación.**

1. **Ningún release publicado en ningún sitio.** Las 13 apps Tauri del ecosistema
   tienen updater configurado en distinto grado, pero no existe ningún
   `latest.json` publicado. Ninguna puede actualizarse hoy end-to-end.
2. **`app.restart()` inalcanzable en Windows** — el problema #4 de este informe es
   un patrón copiado: conviene revisar el mismo bloque en las demás apps con
   updater (`apps/admin`, `apps/business-admin`, `apps/business-client`, y las de
   Partnera/CoinOS).
3. **Updaters sin interfaz**: el patrón "todo en Rust, silencioso" probablemente se
   repite. Las demás apps tampoco informarían al usuario ni mostrarían progreso.
4. **`cargo test` roto por memoria** (problema #6): es una limitación de esta
   máquina, no del código, así que muy probablemente afecta a todas las apps Tauri
   del ecosistema. La solución (`[profile.test] debug = 0`) es de una línea.
5. **Claves de firma compartidas / en el repo** en algunas apps (ya recogido en la
   auditoría de seguridad previa). Eventra Mobile está bien: su clave privada vive
   solo en `~/.eventra-keys` y en el secreto de CI, y está gitignorada.
