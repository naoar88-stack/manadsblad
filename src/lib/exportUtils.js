import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CLOUD_URL = '/api/export';

async function captureElement(elementId, scale = 2) {
  const el = document.getElementById(elementId);
  if (!el) throw new Error(`Element med id "${elementId}" hittades inte.`);

  // Återställ transform tillfälligt så html2canvas mäter rätt storlek
  const prevTransform = el.style.transform;
  const prevOrigin    = el.style.transformOrigin;
  el.style.transform       = 'none';
  el.style.transformOrigin = 'top left';

  // Vänta två frames så layouten hinner stabiliseras
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  const canvas = await html2canvas(el, {
    scale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    width:  el.offsetWidth,
    height: el.offsetHeight,
    logging: false,
    imageTimeout: 8000,
    onclone: (doc) => {
      // Se till att alla bilder är fullupplösta i klonen
      doc.querySelectorAll('img').forEach(img => {
        img.style.imageRendering = 'high-quality';
      });
    },
  });

  el.style.transform       = prevTransform;
  el.style.transformOrigin = prevOrigin;

  return canvas;
}

export async function exportAsPNG(elementId, filename = 'manadsblad.png') {
  const canvas = await captureElement(elementId, 2);
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function exportAsPDF(elementId, format = 'A4', filename = 'manadsblad.pdf') {
  // Capture vid scale 2 för skärpa men skala ned till exakt en A4-sida
  const canvas = await captureElement(elementId, 2);

  const isLandscape = format === 'A4 Liggande';
  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  // Beräkna bildens proportioner
  const imgAspect = canvas.width / canvas.height;
  const pageAspect = pageW / pageH;

  let drawW, drawH, offsetX, offsetY;

  if (imgAspect > pageAspect) {
    // Bilden är bredare — passa bredd
    drawW   = pageW;
    drawH   = pageW / imgAspect;
    offsetX = 0;
    offsetY = (pageH - drawH) / 2;
  } else {
    // Bilden är högre — passa höjd (en sida)
    drawH   = pageH;
    drawW   = pageH * imgAspect;
    offsetX = (pageW - drawW) / 2;
    offsetY = 0;
  }

  // ALLTID en sida — ingen loop, ingen addPage
  const imgData = canvas.toDataURL('image/jpeg', 0.92);
  pdf.addImage(imgData, 'JPEG', offsetX, offsetY, drawW, drawH);
  pdf.save(filename);
}

export async function exportViaCloud(htmlContent, format = 'A4', filename = 'manadsblad.pdf') {
  const res = await fetch(CLOUD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ html: htmlContent, format }),
  });
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
