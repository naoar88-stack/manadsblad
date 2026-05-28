import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CLOUD_URL        = '/api/export';
const CLOUD_TIMEOUT_MS = 20_000;

// ── Formatnormalisering ──────────────────────────────────────────
function isLandscapeFormat(format) {
  if (!format) return false;
  const f = format.toLowerCase();
  return f.includes('landscape') || f.includes('liggande');
}

// Returnerar { w, h } i mm för jsPDF addImage-anrop.
// A4 portrait: 210×297 mm  |  A4 landscape: 297×210 mm
// IG Square:   komponent-native (png-only, pdf => kvadrat 150×150 mm)
// IG Story:    komponent-native (png-only, pdf => 150×267 mm ≈ 9:16)
function getPdfPageDimensions(format) {
  const f = (format || '').toLowerCase();
  if (f.includes('liggande') || f.includes('landscape')) {
    return { orientation: 'landscape', format: 'a4' };
  }
  if (f.includes('ig square') || f.includes('square')) {
    return { orientation: 'portrait', format: [150, 150] };
  }
  if (f.includes('ig story') || f.includes('story')) {
    return { orientation: 'portrait', format: [150, 267] };
  }
  return { orientation: 'portrait', format: 'a4' };
}

// ── Hjälpare: konverterar externa bild-URLs till base64 data-URIs ──
// Används för molnexport så att servern inte behöver hämta externa resurser.
async function inlineImages(el) {
  const imgs = [...el.querySelectorAll('img[src]')];
  await Promise.all(
    imgs.map(async img => {
      const src = img.getAttribute('src');
      if (!src || src.startsWith('data:')) return; // redan inlinead
      try {
        const res    = await fetch(src, { mode: 'cors' });
        const blob   = await res.blob();
        const b64    = await new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
        img.setAttribute('src', b64);
      } catch {
        // Om bild inte kan hämtas: låt den vara — bättre än att krascha exporten
      }
    })
  );
}

// ── Huvud-capture-rutin ──────────────────────────────────────────
async function captureElement(elementId, scale = 2) {
  const el = document.getElementById(elementId);
  if (!el) throw new Error(`Element med id "${elementId}" hittades inte.`);

  const prevTransform       = el.style.transform;
  const prevTransformOrigin = el.style.transformOrigin;

  el.style.transform       = 'none';
  el.style.transformOrigin = 'top left';

  // Vänta två frames så layouten hinner stabiliseras
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  let canvas;
  try {
    canvas = await html2canvas(el, {
      scale,
      useCORS:         true,
      allowTaint:      false,
      backgroundColor: '#ffffff',
      width:           el.offsetWidth,
      height:          el.offsetHeight,
      logging:         false,
      imageTimeout:    8000,
      onclone: (doc) => {
        doc.querySelectorAll('img').forEach(img => {
          img.style.imageRendering = 'high-quality';
        });
      },
    });
  } finally {
    el.style.transform       = prevTransform;
    el.style.transformOrigin = prevTransformOrigin;
  }

  return canvas;
}

// ── PNG-export ───────────────────────────────────────────────────
export async function exportAsPNG(elementId, filename = 'manadsblad.png') {
  const canvas = await captureElement(elementId, 2);
  const link   = document.createElement('a');
  link.download = filename;
  link.href     = canvas.toDataURL('image/png');
  link.click();
}

// ── PDF-export ───────────────────────────────────────────────────
export async function exportAsPDF(elementId, format = 'a4-portrait', filename = 'manadsblad.pdf') {
  const canvas = await captureElement(elementId, 2);

  const { orientation, format: pdfFormat } = getPdfPageDimensions(format);

  const pdf = new jsPDF({
    orientation,
    unit:     'mm',
    format:   pdfFormat,
    compress: true,
  });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  const imgAspect  = canvas.width / canvas.height;
  const pageAspect = pageW / pageH;

  let drawW, drawH, offsetX, offsetY;
  if (imgAspect > pageAspect) {
    drawW   = pageW;
    drawH   = pageW / imgAspect;
    offsetX = 0;
    offsetY = (pageH - drawH) / 2;
  } else {
    drawH   = pageH;
    drawW   = pageH * imgAspect;
    offsetX = (pageW - drawW) / 2;
    offsetY = 0;
  }

  const imgData = canvas.toDataURL('image/jpeg', 0.92);
  pdf.addImage(imgData, 'JPEG', offsetX, offsetY, drawW, drawH);
  pdf.save(filename);
}

// ── Moln-export ──────────────────────────────────────────────────
export async function exportViaCloud(htmlContent, format = 'a4-portrait', filename = 'manadsblad.pdf') {
  // Klona ett temporärt element och inline:a bilder så servern slipper
  // hämta externa resurser (undviker CORS-problem server-side).
  const temp = document.createElement('div');
  temp.innerHTML = htmlContent;
  await inlineImages(temp);
  const inlinedHtml = temp.innerHTML;

  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), CLOUD_TIMEOUT_MS);

  let res;
  try {
    res = await fetch(CLOUD_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ html: inlinedHtml, format }),
      signal:  controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) throw new Error(`Moln-export misslyckades: ${res.status}`);

  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// ── Web Share ────────────────────────────────────────────────────
export async function shareViaWebShare(elementId, title = 'Månadsblad Pro') {
  if (!navigator.share) throw new Error('Web Share API stöds inte i den här webbläsaren.');

  const canvas = await captureElement(elementId, 1.5);
  const blob   = await new Promise(res => canvas.toBlob(res, 'image/png'));

  try {
    await navigator.share({
      title,
      files: [new File([blob], 'manadsblad.png', { type: 'image/png' })],
    });
  } catch (err) {
    // Användaren avbröt själv — inget fel att visa
    if (err?.name === 'AbortError') return;
    throw err;
  }
}
