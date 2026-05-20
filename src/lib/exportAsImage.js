import html2canvas from 'html2canvas';

export async function exportAsImage(element, fileName = 'manadsblad.png') {
  if (!element) return;

  const canvas = await html2canvas(element, {
    backgroundColor: null,
    scale: 2,
  });

  const image = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = image;
  link.download = fileName;
  link.click();
}
