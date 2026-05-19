# API-endpoints (Vercel Serverless)

## Miljövariabler

Lägg till följande i **Vercel Dashboard → Project → Settings → Environment Variables**:

| Variabel | Beskrivning |
|---|---|
| `GEMINI_API_KEY` | Din Gemini API-nyckel från Google AI Studio |
| `CLOUDINARY_CLOUD_NAME` | `difduyste` |
| `CLOUDINARY_API_KEY` | Finns i Cloudinary Dashboard → API Keys |
| `CLOUDINARY_API_SECRET` | Finns i Cloudinary Dashboard → API Keys |

## Endpoints

### `POST /api/improve-text`
Förbättra aktivitetstext via Gemini.
```json
{ "text": "fotboll" }
// Svar:
{ "result": "Fotbollskväll\nKom och spela med oss på planen." }
```

### `POST /api/generate-image`
Generera bild via Imagen och ladda upp till Cloudinary.
```json
{ "text": "fotboll utomhus" }
// Svar:
{ "url": "https://res.cloudinary.com/...", "publicId": "manadsblad/ai/abc123" }
```

### `POST /api/delete-image`
Ta bort en bild från Cloudinary.
```json
{ "publicId": "manadsblad/ai/abc123" }
// Svar:
{ "ok": true }
```
