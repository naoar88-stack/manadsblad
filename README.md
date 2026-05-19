# Manadsblad

En refaktorerad start för en React/Vite-app som bygger månadsblad för fritidsgårdar och aktivitetsplanering.

## Ingår i denna första struktur

- Vite + React-grund
- Uppdelning i komponenter, hooks, lib och data
- Redigerbar månadsvy med aktiviteter
- Valbara veckodagar, månad, år och mall
- Förberedd för nästa steg: Firebase, AI-flöden, bildhantering och export

## Kom igång

```bash
npm install
npm run dev
```

## Föreslagen nästa etapp

1. Lägg till Firebase-konfiguration i `src/lib/firebase.js`
2. Flytta över auth/sync till `src/hooks/useFirebaseSync.js`
3. Lägg till asset library och bilduppladdning
4. Lägg till AI-stöd i `src/lib/aiUtils.js`
5. Lägg till PDF/bildexport
