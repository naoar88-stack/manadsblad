import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Pekar nu på Vercel serverless function istället för Render
const CLOUD_URL = '/api/export';

async function captureElement(elementId) {
  const el = document.getElementById(elementId);
  if (!el) throw new Error(`Element med id "${elementId}" hittades inte.`);
  const prev = el.style.transform;
  el.style.transform = 'scale(1)';
  el.style.transformOrigin = 'top center';
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  const canvas = await html2canvas(el, {
    scale: 2, useCORS: true, allowTaint: false,
    backgroundColor: null, width: el.offsetWidth, height: el.offsetHeight, logging: false,
  });
  el.style.transform = prev;
  return canvas;
}

export async function exportAsPNG(elementId, filename = 'manadsblad.png') {
  const canvas = await captureElement(elementId);
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function exportAsPDF(elementId, format = 'A4', filename = 'manadsblad.pdf') {
  const canvas = await captureElement(elementId);
  const pdf = new jsPDF({ orientation: format === 'A4 Liggande' ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const imgH = pageW * (canvas.height / canvas.width);
  let yPos = 0;
  while (yPos < imgH) {
    if (yPos > 0) pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, -yPos, pageW, imgH);
    yPos += pageH;
  }
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
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename; link.click();
  URL.revokeObjectURL(url);
}

export async function shareViaWebShare(elementId, title = 'Månadsblad Pro') {
  if (!navigator.share) throw new Error('Web Share API stöds inte i den här webbläsaren.');
  const canvas = await captureElement(elementId);
  const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
  await navigator.share({ title, files: [new File([blob], 'manadsblad.png', { type: 'image/png' })] });
}
