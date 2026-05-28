# Changelog — Månadsblad

Alla väsentliga ändringar i projektet dokumenteras här.
Formatet följer [Keep a Changelog](https://keepachangelog.com/sv/1.1.0/).

---

## [Unreleased]

### Tillagt
- `src/__tests__/useHistory.test.js` — 7 enhetstester för undo/redo-logik och MAX_HISTORY
- `src/__tests__/useSchedule.test.js` — 5 enhetstester för dag-initiering och aktivitetshantering
- `src/__tests__/exportUtils.test.js` — tester för `buildFilename` och `inlineExternalImages`
- PWA: manifest, service worker, offline fallback, install-prompt, iOS splash-screen
- Offline-banner och `useOnlineStatus`-hook
- Skeleton loaders för data-laddningstillstånd
- CSP-headers, rate limiting, CORS och input-validering på alla API-routes

### Fixat
- **a11y**: `role="dialog"`, `aria-modal="true"`, `aria-label` och Escape-stängning tillagda på `CropModal`, `AssetManagerModal` och `MagicPasteModal`
- `role="tablist"` + `aria-selected` på flikarna i `AssetManagerModal`
- `aria-label` på alla ikonknappar utan synlig text
- `useSchedule`: render-loop åtgärdad (useCallback på setActivities)
- `useHistory`: MAX_HISTORY = 50 + latestCurrent-ref för att undvika stale closures
- `contentScale` i StudioView: double-RAF så layout stabiliseras före mätning
- Race condition i `useFirebaseSync` vid snabb månadsnavigering (stale-flagga)
- Firebase API-nyckel exponerad i FALLBACK_CONFIG — borttagen
- `ErrorBoundary` runt alla lazy-laddade vyer och modaler
- `removeActivity` centraliserad + `registerDelete`-anrop
- `resetHistory` vid månadsbyten för att förhindra korruption av undo-stack
- Exportflöde: id-mismatch, format-jämförelse, transform-restore och dubbelt exportsystem
- `SchemaView`: `onDragEnd`-cleanup, datum som ISO-sträng, `improveText` finally-block
- `App.jsx`: logoUrl-nyckel, saknade settings-fält, syncTimer cleanup, modal null-guard
- `exportUtils`: IG-format i PDF, tysta AbortError, inline-bilder → base64 för molnexport
- Dead-code `exportAsImage.js` borttagen

### Ändrat
- StudioView: empty-state, disabled export-knapp utan aktiviteter, inline mallnamn
- ExportModal: specifika success-texter per exporttyp (PNG/PDF/dela/moln)
- SVG-ikoner ersätter emoji/text i navigationsläget

---

## [0.1.0] — 2026-05-28

Första fungerande version av Månadsblad — kommunalt månadsblad för fritidsgårdar.

### Inkluderat vid release
- StudioView med format-väljare (A4 liggande/stående, Instagram post/story)
- SchemaView med drag-and-drop-planering
- SettingsView för rubrik, sidfot och logotyp
- Export till PNG, PDF, Dela (Web Share API) och Cloudinary
- Magic Paste med Groq AI för automatisk aktivitetsimport
- Asset Manager med bildbibliotek, uppladdning och AI-bildgenerering (Pollinations)
- Firebase Realtime Database-synk med undo/redo-historik
- Autentisering via Firebase Auth
