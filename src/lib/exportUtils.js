import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CLOUD_URL        = '/api/export';
const CLOUD_TIMEOUT_MS = 20_000;

function isLandscapeFormat(format) {
  if (!format) return false;
  const f = format.toLowerCase();
  return f.includes('landscape') || f.includes('liggande');
}

function getPdfPageDimensions(format) {
  const f = (format || '').toLowerCase();
  if (f.includes('liggande') || f.includes('landscape')) return { orientation: 'landscape', format: 'a4' };
  if (f.includes('ig square') || f.includes('square'))   return { orientation: 'portrait',  format: [150, 150] };
  if (f.includes('ig story')  || f.includes('story'))    return { orientation: 'portrait',  format: [150, 267] };
  return { orientation: 'portrait', format: 'a4' };
}

async function inlineImages(el) {
  const imgs = [...el.querySelectorAll('img[src]')];
  await Promise.all(
    imgs.map(async img => {
      const src = img.getAttribute('src');
      if (!src || src.startsWith('data:')) return;
      try {
        const res  = await fetch(src, { mode: 'cors' });
        const blob = await res.blob();
        const b64  = await new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
        img.setAttribute('src', b64);
      } catch {
        // Om bild inte kan hämtas — låt den vara så exporten kan fortsätta
      }
    })
  );
}

async function captureElement(elementId, scale = 2) {
  const el = document.getElementById(elementId);
  if (!el) throw new Error(`Element med id "${elementId}" hittades inte.`);

  const prevTransform       = el.style.transform;
  const prevTransformOrigin = el.style.transformOrigin;

  // Bug 10-fix: återställ transform i finally så UI aldrig lämnas i skadat tillstånd
  try {
    el.style.transform       = 'none';
    el.style.transformOrigin = 'top left';

    // Vänta två frames så layouten hinner stabiliseras
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    // Bug 9-fix: inline externa bilder innan html2canvas körs
    await inlineImages(el);

    return await html2canvas(el, {
      scale,
      useCORS:         true,
      allowTaint:      false,
      backgroundColor: '#ffffff',
      width:           el.offsetWidth,
      height:          el.offsetHeight,
      logging:         false,
      imageTimeout:    8000,
      onclone: (_doc, clonedEl) => {
        clonedEl.querySelectorAll('img').forEach(img => {
          img.style.imageRendering = 'high-quality';
          img.onerror = () => {
            img.style.visibility = 'hidden';
          };
        });
      },
    });
  } finally {
    el.style.transform       = prevTransform;
    el.style.transformOrigin = prevTransformOrigin;
  }
}

export async function exportAsPNG(elementId, filename = 'manadsblad.png') {
  const canvas = await captureElement(elementId, 2);
  const link   = document.createElement('a');
  link.download = filename;
  link.href     = canvas.toDataURL('image/png');
  link.click();
}

export async function exportAsPDF(elementId, format = 'a4', filename = 'manadsblad.pdf') {
  const canvas = await captureElement(elementId, 2);

  // Bug 11-fix: `format` skickas nu korrekt från useExport → rätt orientering/dimensioner
  const { orientation, format: pdfFormat } = getPdfPageDimensions(format);
  const pdf = new jsPDF({ orientation, unit: 'mm', format: pdfFormat, compress: true });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgAspect  = canvas.width / canvas.height;
  const pageAspect = pageW / pageH;

  let drawW, drawH, offsetX, offsetY;
  if (imgAspect > pageAspect) {
    drawW = pageW; drawH = pageW / imgAspect;
    offsetX = 0;   offsetY = (pageH - drawH) / 2;
  } else {
    drawH = pageH; drawW = pageH * imgAspect;
    offsetX = (pageW - drawW) / 2; offsetY = 0;
  }

  pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', offsetX, offsetY, drawW, drawH);
  pdf.save(filename);
}

export async function exportViaCloud(htmlContent, format = 'a4-portrait', filename = 'manadsblad.pdf') {
  const temp = document.createElement('div');
  temp.innerHTML = htmlContent;
  await inlineImages(temp);

  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), CLOUD_TIMEOUT_MS);

  let res;
  try {
    res = await fetch(CLOUD_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ html: temp.innerHTML, format }),
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
    if (err?.name === 'AbortError') return; // användaren avbröt själv
    throw err;
  }
}
