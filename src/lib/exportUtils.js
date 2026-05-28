import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CLOUD_URL = '/api/export';
const CLOUD_TIMEOUT_MS = 20_000;

// Normaliserar formatsträng till orientering för jsPDF
// Accepterar 'a4-landscape', 'A4 Liggande', 'landscape' etc.
function isLandscapeFormat(format) {
  if (!format) return false;
  const f = format.toLowerCase();
  return f.includes('landscape') || f.includes('liggande');
}

async function captureElement(elementId, scale = 2) {
  const el = document.getElementById(elementId);
  if (!el) throw new Error(`Element med id "${elementId}" hittades inte.`);

  // Spara nuvarande transform INNAN vi ändrar något
  const prevTransform       = el.style.transform;
  const prevTransformOrigin = el.style.transformOrigin;

  // Återställ transform tillfälligt så html2canvas mäter rätt storlek
  el.style.transform       = 'none';
  el.style.transformOrigin = 'top left';

  // Vänta två frames så layouten hinner stabiliseras
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  let canvas;
  try {
    canvas = await html2canvas(el, {
      scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      width:  el.offsetWidth,
      height: el.offsetHeight,
      logging: false,
      imageTimeout: 8000,
      onclone: (doc) => {
        doc.querySelectorAll('img').forEach(img => {
          img.style.imageRendering = 'high-quality';
        });
      },
    });
  } finally {
    // Återställ alltid transform, även vid fel
    el.style.transform       = prevTransform;
    el.style.transformOrigin = prevTransformOrigin;
  }

  return canvas;
}

export async function exportAsPNG(elementId, filename = 'manadsblad.png') {
  const canvas = await captureElement(elementId, 2);
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function exportAsPDF(elementId, format = 'a4-portrait', filename = 'manadsblad.pdf') {
  const canvas = await captureElement(elementId, 2);

  // Normaliserad jämförelse — hanterar 'a4-landscape', 'A4 Liggande', 'landscape' m.fl.
  const landscape = isLandscapeFormat(format);

  const pdf = new jsPDF({
    orientation: landscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
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

  // ALLTID en sida
  const imgData = canvas.toDataURL('image/jpeg', 0.92);
  pdf.addImage(imgData, 'JPEG', offsetX, offsetY, drawW, drawH);
  pdf.save(filename);
}

export async function exportViaCloud(htmlContent, format = 'a4-portrait', filename = 'manadsblad.pdf') {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLOUD_TIMEOUT_MS);

  let res;
  try {
    res = await fetch(CLOUD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html: htmlContent, format }),
      signal: controller.signal,
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

export async function shareViaWebShare(elementId, title = 'Månadsblad Pro') {
  if (!navigator.share) throw new Error('Web Share API stöds inte i den här webbläsaren.');
  const canvas = await captureElement(elementId, 1.5);
  const blob   = await new Promise(res => canvas.toBlob(res, 'image/png'));
  await navigator.share({
    title,
    files: [new File([blob], 'manadsblad.png', { type: 'image/png' })],
  });
}
