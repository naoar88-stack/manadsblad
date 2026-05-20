import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CLOUD_URL = 'https://manadsblad-export.onrender.com/api/export';

/**
 * Tvinga zoom till 100 % innan rendering så html2canvas får rätt upplösning.
 * Återställ zoomen efteråt.
 */
async function captureElement(elementId) {
  const el = document.getElementById(elementId);
  if (!el) throw new Error(`Element med id "${elementId}" hittades inte.`);

  // Spara nuvarande transform och sätt till 100 %
  const prev = el.style.transform;
  el.style.transform = 'scale(1)';
  el.style.transformOrigin = 'top center';

  // Vänta en frame så layout hinner räknas om
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  const canvas = await html2canvas(el, {
    scale:           2,          // 2× för hög upplösning
    useCORS:         true,
    allowTaint:      false,
    backgroundColor: null,
    width:           el.offsetWidth,
    height:          el.offsetHeight,
    logging:         false,
  });

  // Återställ
  el.style.transform = prev;

  return canvas;
}

/** Exportera som PNG-bild */
export async function exportAsPNG(elementId, filename = 'manadsblad.png') {
  const canvas = await captureElement(elementId);
  const link   = document.createElement('a');
  link.download = filename;
  link.href     = canvas.toDataURL('image/png');
  link.click();
}

/** Exportera som lokal PDF med jsPDF */
export async function exportAsPDF(elementId, format = 'A4', filename = 'manadsblad.pdf') {
  const canvas = await captureElement(elementId);

  const isLandscape = format === 'A4 Liggande';
  const orientation = isLandscape ? 'landscape' : 'portrait';
  const pdf         = new jsPDF({ orientation, unit: 'mm', format: 'a4' });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  const imgData  = canvas.toDataURL('image/jpeg', 0.95);
  const imgRatio = canvas.height / canvas.width;
  const imgH     = pageW * imgRatio;

  // Om bilden är högre än en sida — dela upp på flera sidor
  let yPos = 0;
  while (yPos < imgH) {
    if (yPos > 0) pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, -yPos, pageW, imgH);
    yPos += pageH;
  }

  pdf.save(filename);
}

/** Moln-export via Render-server */
export async function exportViaCloud(htmlContent, format = 'A4', filename = 'manadsblad.pdf') {
  const res = await fetch(CLOUD_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ html: htmlContent, format }),
  });

  if (!res.ok) throw new Error(`Moln-export misslyckades: ${res.status} ${res.statusText}`);

  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Web Share API — dela direkt till sociala appar */
export async function shareViaWebShare(elementId, title = 'Månadsblad Pro') {
  if (!navigator.share) throw new Error('Web Share API stöds inte i den här webbläsaren.');

  const canvas = await captureElement(elementId);
  const blob   = await new Promise(res => canvas.toBlob(res, 'image/png'));
  const file   = new File([blob], 'manadsblad.png', { type: 'image/png' });

  await navigator.share({ title, files: [file] });
}
