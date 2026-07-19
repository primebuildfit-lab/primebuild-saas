# Eventra Business Admin — Auto-Updater oficial de Tauri

**Aplicación:** `apps/business-admin` (`com.eventra.business.admin`, "Eventra Business Admin")
**Repositorio:** `D:\empresas\Eventra\eventra`, rama `feat/eventra-admin-tauri`
**Fecha:** 2026-07-18
**Alcance:** SOLO esta aplicación. Ninguna otra app del ecosistema fue modificada.

---

## 1. Resultado

El sistema **oficial** de Tauri (`tauri-plugin-updater` 2.10.1 sobre Tauri 2.11.5) queda
completamente funcional. No se creó ningún updater propio: toda descarga, verificación
de firma minisign e invocación del instalador la hace el plugin.

Se verificó con una **actualización real entre dos versiones distintas** (0.1.0 → 0.1.1),
instalador NSIS incluido, y con una **prueba negativa de firma manipulada**. No se asumió
nada: los resultados están en §6 con las trazas de log.

---

## 2. Configuración encontrada (auditoría previa)

La app ya tenía una base parcial, no una implementación completa.

### Correcto de partida

| Elemento | Estado |
|---|---|
| `tauri-plugin-updater = "2"` en `Cargo.toml` | Presente |
| Plugin registrado en `lib.rs` | Presente |
| `bundle.createUpdaterArtifacts: true` | Presente |
| `plugins.updater.pubkey` | Presente y **coincide** con `src-tauri/.tauri/business-admin-updater.key.pub` |
| Par de claves de firma local | Presente, sin contraseña, correctamente en `.gitignore` |
| `identifier`, iconos, `productName` | Correctos y únicos |
| Versión en las 3 fuentes | Sincronizada en 0.1.0 |
| `installMode: passive` (NSIS) | Correcto para actualizaciones |

### Problemas detectados

| # | Problema | Gravedad |
|---|---|---|
| P1 | **Cero experiencia de usuario.** Todo el flujo era silencioso en Rust, sólo a log. No había búsqueda manual, ni progreso, ni aviso de versión nueva, ni confirmación de "ya está actualizada". | Alta |
| P2 | **Instalación silenciosa forzada.** El arranque descargaba e instalaba solo, reiniciando la app sin permiso. En una consola de supervisión en vivo eso interrumpe al operador sin aviso. | Alta |
| P3 | **`app.restart()` era código muerto.** En Windows `Update::install` lanza el instalador y hace `std::process::exit(0)`; la línea posterior nunca se ejecuta. La intención ("reiniciar") dependía de una llamada inalcanzable. | Media |
| P4 | **Callback de progreso vacío:** `download_and_install(\|_chunk, _total\| {}, \|\| {})`. Imposible mostrar progreso. | Media |
| P5 | **Endpoint duplicado y divergente.** Estaba en `tauri.conf.json` *y* reconstruido en Rust desde `EVENTRA_UPDATE_OWNER`/`EVENTRA_UPDATE_REPO`, con lógica de placeholder `REPLACE_` propia. Dos fuentes de verdad que podían discrepar. | Media |
| P6 | **Canal de publicación inviable.** El endpoint apuntaba a `releases/latest/download/latest-business-admin.json`. Este monorepo publica también Eventra Internal OS y Eventra Mobile: `releases/latest` resuelve a la release *más reciente de cualquier producto*, así que el manifiesto de Business Admin quedaría tapado en cuanto otro producto publicara. | **Crítica** |
| P7 | **No existía workflow de release** para esta app. `latest-business-admin.json` no se publicaba nunca; el updater no podía funcionar en producción. | **Crítica** |
| P8 | **Sin guardia de versión.** Nada impedía que `package.json`, `Cargo.toml` y `tauri.conf.json` divergieran, lo que rompe la comparación de versiones de forma silenciosa. | Media |
| P9 | **`lto = true` + `codegen-units = 1`** agotaba la memoria al enlazar (`rustc-LLVM ERROR: out of memory`) — la release no se podía construir de forma fiable en esta máquina. | Media |
| P10 | Sin scripts de escritorio para esta app en el `package.json` raíz. | Baja |

---

## 3. Cambios realizados

### 3.1 Rust — `src-tauri/src/updater.rs` (reescrito)

- **Superficie IPC estrecha y segura.** Tres comandos propios: `updater_state`,
  `updater_check`, `updater_install`. El webview **nunca** recibe permisos del plugin
  updater y **ninguna URL, ruta o clave cruza** la frontera IPC: la web no puede
  redirigir la actualización a otro origen.
- **Comprobación automática al arranque que sólo comprueba** (P2). El resultado se
  cachea en `UpdaterState` y se emite como `eventra://update-state`. Instalar es una
  decisión explícita del operador.
- **Sin carrera de eventos:** el frontend lee la caché al montar *y* se suscribe al
  evento, así que nunca pierde el resultado ni dispara una segunda petición de red.
- **Progreso real** (P4): `eventra://update-progress` por chunk con bytes y porcentaje,
  y `eventra://update-phase` con las fases `checking → downloading → verifying →
  installing` (`verifying` se emite en el callback de fin de descarga, justo antes de
  que el plugin valide la firma).
- **Eliminado el `app.restart()` inalcanzable** (P3) y documentado por qué: en Windows
  el propio plugin termina el proceso y NSIS `/UPDATE` relanza la app.
- **Endpoint con una sola fuente de verdad** (P5): `tauri.conf.json`. Se eliminaron
  `EVENTRA_UPDATE_OWNER`/`EVENTRA_UPDATE_REPO` y la lógica `REPLACE_`. Sólo queda
  `EVENTRA_UPDATE_ENDPOINT` como override documentado para pruebas controladas.
- **Errores accionables en español** (`explain()`), con el error crudo al log. Incluye
  el mensaje real que emite el plugin cuando el manifiesto no existe todavía
  (`Could not fetch a valid release JSON from the remote`), observado contra el canal
  real antes de publicar ninguna release.
- **Hook de prueba acotado:** `EVENTRA_UPDATE_AUTOINSTALL=1` instala automáticamente,
  pero **sólo si además hay un endpoint privado activo** — es inerte contra el canal
  real. Existe para poder verificar el ciclo completo sin un clic humano.

### 3.2 Interfaz — nuevos `src/os/updates.ts` y `src/os/updatesUi.tsx`

- `UpdaterProvider` en `App.tsx`: **un solo ciclo de vida** compartido por la topbar y
  Configuración (dos hooks independientes duplicarían listeners y dejarían la búsqueda
  manual invisible para la otra vista).
- **Configuración → Actualizaciones**: estado, versión instalada, botón *Buscar
  actualizaciones*, barra de progreso con porcentaje, botón *Instalar y reiniciar*
  (sólo cuando hay versión nueva), errores y canal de publicación.
- **Indicador en la topbar**: aparece sólo cuando hay algo que hacer (versión nueva o
  instalación en curso). No interrumpe cuando la app está al día.
- **Degradación honesta**: fuera de la app instalada (navegador, dev) informa de que las
  actualizaciones sólo existen en el escritorio, en vez de afirmar falsamente "estás al día".
- Barra indeterminada cuando el servidor no envía `Content-Length` (nunca un porcentaje
  inventado), y respeta `prefers-reduced-motion`.

### 3.3 Canal de publicación

- **`tauri.conf.json`** (P6): endpoint cambiado a un **tag rodante fijo**
  `.../releases/download/business-admin-latest/latest-business-admin.json`, inmune a las
  releases de los otros productos del monorepo.
- **`.github/workflows/release-eventra-business-admin.yml`** (nuevo, P7): construye,
  firma y publica la release versionada, y luego **recrea la release rodante
  `business-admin-latest`** con el manifiesto renombrado a `latest-business-admin.json`.
  Antes de publicarlo **valida que el manifiesto trae versión, plataformas, `url` y
  `signature`**, y falla ruidosamente si no — un manifiesto sin firma haría que todas
  las instalaciones rechazaran la actualización.
- **Secreto propio**: `EVENTRA_BUSINESS_ADMIN_SIGNING_KEY`. Esta app **no comparte clave**
  con Internal OS (`EVENTRA_DESKTOP_SIGNING_KEY`) ni con Mobile (`TAURI_SIGNING_PRIVATE_KEY`).

### 3.4 Robustez de build

- **`scripts/check-version-sync.mjs`** (nuevo, P8): falla si las tres versiones divergen.
  Se ejecuta en CI antes de construir. Expuesto como `npm run check:version`.
- **`Cargo.toml`** (P9): `lto = "thin"` + `codegen-units = 4` en lugar de LTO completo en
  una sola unidad. La máquina tiene 13.8 GB (5.2 GB libres) y el LTO completo agotaba la
  memoria al enlazar. Con thin LTO la release se construye de forma reproducible.
- **`package.json` raíz** (P10): `desktop:business-admin:dev` y `:build`.

### 3.5 Tests

- **`test/updates.test.tsx`** (nuevo, 15 tests): mensajes por cada estado, formato de
  progreso, degradación fuera del escritorio, y render del panel de Configuración
  (incluye que **no** se ofrece instalar cuando no hay versión nueva).
- `test/business-admin.test.tsx`: `renderAt` pasa a `async` con `act` para que los
  efectos asíncronos del provider no generen avisos. Los 10 tests previos siguen verdes.

---

## 4. Archivos tocados

```
apps/business-admin/
  src-tauri/src/updater.rs              reescrito
  src-tauri/src/lib.rs                  comandos + estado + comentario de política
  src-tauri/tauri.conf.json             endpoint → tag rodante
  src-tauri/Cargo.toml                  perfil release (thin LTO)
  src/App.tsx                           UpdaterProvider
  src/os/Shell.tsx                      indicador en topbar
  src/os/pages.tsx                      panel en Configuración
  src/os/theme.css                      estilos del updater
  src/os/updates.ts                     NUEVO  cliente IPC + helpers puros
  src/os/updatesUi.tsx                  NUEVO  hook + provider + UI
  scripts/check-version-sync.mjs        NUEVO  guardia de versión
  test/updates.test.tsx                 NUEVO  15 tests
  test/business-admin.test.tsx          render async
  package.json                          script check:version
.github/workflows/release-eventra-business-admin.yml   NUEVO
package.json (raíz)                     scripts desktop:business-admin:*
```

Nota: `apps/business-admin/` está **sin seguir por git** (nunca se ha hecho commit del
directorio). No se hizo commit ni push.

---

## 5. Pruebas ejecutadas

| Prueba | Resultado |
|---|---|
| `check-version-sync` | ✅ 0.1.0 en las 3 fuentes |
| `npm run typecheck` (tsc --noEmit) | ✅ sin errores |
| `npm test` (vitest) | ✅ **25/25** (10 previos + 15 nuevos) |
| `cargo check` | ✅ sin errores |
| `cargo clippy` | ✅ sin warnings |
| `tauri build` | ✅ NSIS + MSI + **ambos `.sig`** generados |
| Instalador NSIS | ✅ instala en `%LOCALAPPDATA%\Eventra Business Admin` |
| **Actualización real 0.1.0 → 0.1.1** | ✅ ver §6 |
| **Firma manipulada rechazada** | ✅ ver §6 |
| Transporte inseguro rechazado | ✅ ver §6 |

*Lint:* esta app no define script `lint`. `prettier --check` falla tanto en los archivos
nuevos como en los preexistentes (`pages.tsx`, `ui.tsx`, `App.tsx`, `launchApp.ts`), es
decir el formateo **no está aplicado en esta app**; no se reformateó nada para no generar
ruido ajeno a esta tarea. Ver §8.

---

## 6. Prueba real de actualización

**Montaje:** se construyeron y firmaron dos versiones distintas con la clave real de la
app (0.1.0 y 0.1.1), un manifiesto con la **firma real** de `.sig`, y un servidor
estático local en `127.0.0.1:8787`. Se instaló la 0.1.0 y se dejó un fichero marcador en
`%APPDATA%\com.eventra.business.admin` para comprobar la preservación de datos locales.

**Resultado — traza de log de la app instalada:**

```
[19:41:15] Eventra Business Admin starting — v0.1.0
[19:41:15] updater: nueva versión disponible: 0.1.1
[19:41:15] updater: [checking]    Confirmando la versión publicada…
[19:41:15] updater: [downloading] Descargando la versión 0.1.1…
[19:41:15] updater: [verifying]   Verificando la firma…
[19:41:15] updater: [installing]  Instalando la versión 0.1.1…
[19:41:20] Eventra Business Admin starting — v0.1.1     ← relanzada por NSIS /UPDATE
```

| Comprobación | Resultado |
|---|---|
| Detecta la versión nueva | ✅ 0.1.1 |
| Descarga desde el manifiesto | ✅ el servidor sirvió el `.exe` (1.959.599 bytes) |
| Verifica la firma | ✅ fase `verifying` superada |
| Instala | ✅ |
| Reinicia | ✅ proceso original terminado, relanzado como **0.1.1** |
| Versión en disco tras actualizar | ✅ `0.1.1` |
| **Datos locales preservados** | ✅ marcador intacto; `.window-state.json`, logs y perfil WebView2 conservados |

### 6.1 Prueba negativa — firma manipulada (rollback)

Se sirvió un manifiesto anunciando "0.1.2" con la firma **corrompida a propósito**:

```
[20:28:55] updater: nueva versión disponible: 0.1.2
[20:28:55] updater: [downloading] Descargando la versión 0.1.2…
[20:28:55] updater: [verifying]   Verificando la firma…
[20:28:55] updater: The signature verification failed
[20:28:55] updater: [error] La firma de la actualización no es válida.
                            Se descartó la descarga y la aplicación sigue en la versión actual.
```

Versión tras el intento: **0.1.0**, proceso vivo, instalación intacta. Éste es el
comportamiento de rollback: la firma se valida **antes** de tocar nada, así que un
paquete manipulado no puede dejar la instalación a medias.

### 6.2 Transporte seguro verificado

El primer intento de prueba usó `http://`. El plugin lo **rechazó**:

```
The configured updater endpoint must use a secure protocol like `https`.
```

Es un control de seguridad correcto y quedó verificado positivamente sobre la
configuración publicada. Para poder ejercitar el resto del ciclo en local se construyó
una base **sólo de prueba** con `dangerousInsecureTransportProtocol`, mediante un overlay
`--config` guardado **fuera del repositorio**. Ese flag **no está en la configuración
publicada** (`grep dangerous tauri.conf.json` → 0 coincidencias), y de hecho la 0.1.1
instalada por la actualización —que sí lleva la config real— volvió a rechazar el
endpoint http, confirmándolo desde dentro de la propia prueba.

Tras las pruebas se reinstaló la build publicada (0.1.0, HTTPS estricto), se borró el
marcador y se detuvo el servidor local.

---

## 7. Cómo publicar una versión nueva (ya operativo)

El canal está activo. Para publicar:

1. Subir la versión en las **tres** fuentes (`package.json`, `src-tauri/Cargo.toml`,
   `src-tauri/tauri.conf.json`). `npm run check:version` lo valida.
2. Commit y `git tag business-admin-vX.Y.Z && git push origin business-admin-vX.Y.Z`.
3. El workflow construye, firma, publica la release versionada y **recrea el tag
   rodante** `business-admin-latest` con el manifiesto.
4. Las instalaciones existentes detectan la versión al abrirse y el operador la
   instala desde Configuración → Actualizaciones.

**No usar `gh run rerun`** para reintentar un release fallido: reutiliza el token del
run original y falla al crear la release. Hay que re-empujar el tag.

El secreto `EVENTRA_BUSINESS_ADMIN_SIGNING_KEY` ya está configurado. Si alguna vez hay
que reponerlo, debe cargarse **el contenido** del archivo, nunca su ruta:

```
gh secret set EVENTRA_BUSINESS_ADMIN_SIGNING_KEY < apps/business-admin/src-tauri/.tauri/business-admin-updater.key
```

---

## 7.bis Release real publicado y verificado (2026-07-19) — ✅ COMPLETADO

**El canal está vivo y la actualización automática funciona contra producción.**

| Publicado | Tag | Contenido |
|---|---|---|
| Eventra Business Admin 0.1.0 | `business-admin-v0.1.0` | NSIS + MSI + ambos `.sig` + `latest.json` |
| Eventra Business Admin 0.1.1 | `business-admin-v0.1.1` | ídem |
| Canal de actualización | `business-admin-latest` | `latest-business-admin.json` (rodante) |

### Prueba real sobre el canal de GitHub

App instalada en 0.1.0, sin servidor local ni artefactos de prueba — manifiesto y
paquete descargados de GitHub:

```
12:59:34  Eventra Business Admin starting — v0.1.0
12:59:35  updater: nueva versión disponible: 0.1.1
12:59:36  updater: [verifying]  Verificando la firma…
12:59:36  updater: [installing] Instalando la versión 0.1.1…
12:59:41  Eventra Business Admin starting — v0.1.1     ← relanzada por NSIS /UPDATE
12:59:41  updater: al día (v0.1.1)
```

Datos locales preservados (marcador en `%APPDATA%` intacto). La versión nueva
consultó el canal real y reportó correctamente estar al día.

### Un fallo que sólo apareció al publicar

El manifiesto de 0.1.0 resolvía `windows-x86_64` —la clave que usa el updater por
defecto— al **MSI**, porque es lo que `tauri-action` prefiere. La app se distribuye
por **NSIS** con `installMode: currentUser`: una actualización vía MSI habría
instalado por otra ruta y pedido elevación. Corregido con
`updaterJsonPreferNsis: true`; desde 0.1.1 la clave resuelve al `setup.exe`, que es
la vía verificada end-to-end.

Esto no se podía detectar en local: el manifiesto lo genera CI, no `tauri build`.

### Los cuatro bloqueos que hubo que resolver

| # | Fallo | Causa | Solución |
|---|---|---|---|
| 1 | `Missing script: "tauri"` | `tauri-action` ejecuta `npm run tauri build`; la app sólo tenía `desktop:build` | Script `tauri` añadido |
| 2 | `"PLATFORM_OWNER" is not exported` | La app dependía de 710 líneas sin commitear en `packages/identity` y `packages/config` | Commiteadas aparte (typecheck 14 workspaces + 69 tests verdes) |
| 3 | `failed to decode base64 secret key: Invalid symbol 58, offset 1` | El secreto contenía la **ruta** del archivo, no su contenido (símbolo 58 = `:`, de `D:\...`) | Resubido con `gh secret set < archivo` |
| 4 | `Resource not accessible by integration` | Se relanzaba con `gh run rerun`, que reutiliza el token del run original | Re-push del tag → run nuevo |

Sobre el #4: se cambió `default_workflow_permissions` de `read` a `write` creyendo
que era la causa. **No lo era** — `release-eventra-mobile` publicó su release a las
12:01 con el ajuste aún en `read`, porque los workflows declaran sus propios
`permissions`. Ese cambio de ajuste es innecesario y puede revertirse.

### El tag rodante demostró su valor el mismo día

Mientras se trabajaba, `Eventra Internal OS 0.1.0` se publicó y quedó marcada como
`Latest` en el repositorio. Con el endpoint original
(`releases/latest/download/...`) el manifiesto de Business Admin habría quedado
tapado en ese instante. Con el tag fijo `business-admin-latest` es inmune —
exactamente el problema P6 de la auditoría, materializado en producción.

---

## 7.ter Historial: el bloqueo previo (resuelto)

Se creó el secreto `EVENTRA_BUSINESS_ADMIN_SIGNING_KEY` y se empujó el tag
`business-admin-v0.1.0`. **Dos ejecuciones del workflow, ambas fallidas**, ninguna
por culpa de la clave (llegó al runner con valor: `TAURI_SIGNING_PRIVATE_KEY: ***`).

| Run | Fallo | Estado |
|---|---|---|
| [29667153591](https://github.com/primebuildfit-lab/primebuild-saas/actions/runs/29667153591) | `npm error Missing script: "tauri"` — tauri-action ejecuta `npm run tauri build` y la app sólo definía `desktop:build` | **CORREGIDO** (script `tauri` añadido) |
| [29667280874](https://github.com/primebuildfit-lab/primebuild-saas/actions/runs/29667280874) | `"PLATFORM_OWNER" is not exported by packages/identity/src/index.ts` | **BLOQUEANTE, sin resolver** |

### El bloqueo de fondo

`apps/business-admin` importa de los paquetes compartidos cuatro símbolos que
**no existen en el estado commiteado** del repositorio:

| Símbolo | Paquete | En HEAD |
|---|---|---|
| `PLATFORM_OWNER` | `@eventra/identity` | ✗ falta |
| `BUSINESS_ADMIN_PERMISSIONS` | `@eventra/identity` | ✗ falta |
| `businessAdminCan` | `@eventra/identity` | ✗ falta |
| `PlatformRole` | `@eventra/identity` | ✓ existe |

Viven en **710 líneas sin commitear** (`packages/identity/src/index.ts` +539,
`packages/config/src/index.ts` +67, `packages/identity/test/identity.test.ts` +107),
trabajo de sesiones anteriores. En local todo compila porque el árbol sucio las tiene;
CI clona el estado commiteado y no las encuentra.

Las mismas dependencias afectan a `@eventra/config` (`EVENTRA_APP_LINKS`,
`deepLinkFor`, `resolveBusinessClientUrl`, `EventraTauriApp`), usadas por el
launcher entre apps.

**Estado del árbol pendiente (verificado 2026-07-19):** typecheck de los **14
workspaces** en verde y **69 tests** de `identity` + `config` pasando. Las únicas
líneas eliminadas son comentarios; el resto es puramente aditivo. Es decir, ese
trabajo pendiente está sano — sólo hay que decidir si se commitea.

**Decisión pendiente del propietario.** Commitear esos paquetes excede el alcance
declarado de esta tarea ("no modificar ninguna otra aplicación"): los consumen
`admin`, `business-client` y `consumer`. Hasta que se resuelva, el release **no
puede completarse**; el updater está listo pero sin canal publicado.

**Estado del remoto ahora mismo:** la rama tiene el trabajo del updater y el fix
del script `tauri`. El tag `business-admin-v0.1.0` **existe pero apunta a un commit
que no compila en CI** — conviene borrarlo (`git push origin :refs/tags/business-admin-v0.1.0`)
o dejarlo para re-tagear cuando se desbloquee. No se creó ninguna release.

---

## 8. Problemas del ECOSISTEMA (documentados, NO modificados)

Detectados durante el trabajo. Afectan a otras aplicaciones, así que **no se tocó nada**.

### E1 — Otras apps consultan actualizaciones contra `127.0.0.1` ⚠️

El servidor de prueba local recibió peticiones que **no eran mías**:

```
2026-07-18T19:32:09Z  404 affiliate-latest.json
2026-07-18T19:36:58Z  404 latest.json
2026-07-18T19:36:58Z  404 Nexus_0.6.1_x64-setup.exe
```

Hay al menos dos apps instaladas (aparentemente **Partnera Affiliate** y **Platform
Nexus**, por los nombres) con el endpoint de actualización apuntando a
`http://127.0.0.1:8787`. Implica dos cosas:

- **su canal de actualización no funciona** (siempre 404 salvo que algo escuche en ese puerto);
- **cualquier proceso local que abra el 8787 les sirve un manifiesto**. La verificación de
  firma minisign sigue protegiéndolas de instalar un paquete ajeno, pero el endpoint de
  producción no debería ser localhost. Merece revisión dedicada.

Nótese además que esas apps usan HTTP contra localhost, lo que sugiere que llevan
`dangerousInsecureTransportProtocol` activado en su configuración publicada.

### E2 — `releases/latest` es inservible en este monorepo

El repositorio aloja Internal OS, Mobile y Business Admin. `release-eventra-desktop.yml`
lo reconoce en un comentario, pero **Internal OS sigue usando
`releases/latest/download/latest.json`**: en cuanto otro producto publique, su updater
deja de encontrar el manifiesto. Business Admin ya está resuelto con el tag rodante; el
mismo patrón serviría para los demás.

### E3 — `apps/admin` tampoco puede publicar: le falta el script `tauri`

`release-eventra-desktop.yml` usa `tauri-action`, que invoca `npm run tauri build`.
`apps/admin/package.json` define `desktop:build` pero **no `tauri`**, exactamente la
misma carencia que bloqueó el primer intento de Business Admin. Su workflow fallaría
con `Missing script: "tauri"` antes siquiera de compilar.

Esto explica que el repositorio tenga **0 releases** pese a llevar ese workflow
desde hace días: nunca llegó a publicar nada, así que el updater del Internal OS
no ha funcionado nunca en producción. La corrección es una línea (`"tauri": "tauri"`)
en su `package.json`, pero queda fuera del alcance de esta tarea.

### E4 — El formateo no está aplicado

`npm run format` (prettier --check) falla en archivos preexistentes de esta app. El script
`check` del raíz no incluye `format`, así que nunca se detecta. Es una limpieza global,
no de esta tarea.

---

## 9. Posibles mejoras

1. **Notas de versión en la UI.** El manifiesto ya trae `notes` y el backend lo expone en
   `CheckOutcome::Available`; el panel aún no las muestra.
2. **Recomprobación periódica.** Hoy se comprueba al arrancar y a demanda. Una consola de
   supervisión puede estar abierta días; un chequeo cada N horas cerraría esa ventana.
3. **Reanudar descargas.** El plugin descarga a memoria sin reanudación; con una conexión
   mala, una descarga cortada se reintenta desde cero.
4. **Firma de código Authenticode.** Los instaladores no están firmados con certificado de
   Windows, así que SmartScreen advierte en la primera instalación. Es independiente de la
   firma minisign del updater.
5. **Canal beta.** Un segundo tag rodante (`business-admin-beta`) permitiría probar
   versiones con operadores concretos antes del despliegue general.
6. **Verificación del workflow en CI.** El workflow nuevo no se ha ejecutado nunca (requiere
   el secreto). La primera ejecución debería vigilarse.
