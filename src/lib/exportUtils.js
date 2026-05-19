const FORMAT_PRESETS = {
  'a4-landscape': {
    pdf: { orientation: 'landscape', format: 'a4' },
    suffix: 'a4-liggande',
  },
  'a4-portrait': {
    pdf: { orientation: 'portrait', format: 'a4' },
    suffix: 'a4-staende',
  },
  'instagram-post': {
    pdf: { orientation: 'portrait', format: [1080, 1080] },
    suffix: 'instagram-post',
  },
  'instagram-story': {
    pdf: { orientation: 'portrait', format: [1080, 1920] },
    suffix: 'instagram-story',
  },
};

export function getExportFormatPreset(format) {
  return FORMAT_PRESETS[format] || FORMAT_PRESETS['a4-landscape'];
}

export async function ensureExportLibraries() {
  const loadScript = (src, id) => new Promise((resolve, reject) => {
    const existing = document.getElementById(id);
    if (existing) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.id = id;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Kunde inte ladda biblioteket: ${src}`));
    document.body.appendChild(script);
  });

  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', 'html2canvas-lib');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'jspdf-lib');
}

async function renderCanvas(element) {
  if (!element) throw new Error('Ingen exportyta hittades.');
  await ensureExportLibraries();
  try {
    return await window.html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: Math.max(2, window.devicePixelRatio || 1.5),
      useCORS: true,
      logging: false,
      imageTimeout: 15000,
      removeContainer: true,
    });
  } catch {
    throw new Error('Kunde inte rendera exportytan. Kontrollera bilder och försök igen.');
  }
}

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export async function exportAsPng(element, filename = 'manadsblad.png') {
  const canvas = await renderCanvas(element);
  try {
    downloadDataUrl(canvas.toDataURL('image/png', 1), filename);
  } catch {
    throw new Error('Kunde inte skapa PNG-filen.');
  }
}

export async function exportAsPdf(element, format, filename = 'manadsblad.pdf') {
  const canvas = await renderCanvas(element);
  try {
    const imgData = canvas.toDataURL('image/png', 1);
    const { jsPDF } = window.jspdf;
    const preset = getExportFormatPreset(format);
    const pdf = new jsPDF({
      orientation: preset.pdf.orientation,
      unit: 'px',
      format: preset.pdf.format,
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const renderWidth = canvas.width * ratio;
    const renderHeight = canvas.height * ratio;
    const offsetX = (pageWidth - renderWidth) / 2;
    const offsetY = (pageHeight - renderHeight) / 2;

    pdf.addImage(imgData, 'PNG', offsetX, offsetY, renderWidth, renderHeight, undefined, 'FAST');
    pdf.save(filename);
  } catch {
    throw new Error('Kunde inte skapa PDF-filen.');
  }
}
