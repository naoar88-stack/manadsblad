export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Komprimerar bild och returnerar { blob, dataUrl }.
 * blob används för uppladdning till Cloudinary.
 * dataUrl används som optimistisk lokal preview.
 */
export function compressImageToBlob(file, maxWidth = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error('canvas.toBlob misslyckades')); return; }
            resolve({ blob, dataUrl: canvas.toDataURL('image/jpeg', quality) });
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Bakåtkompatibel wrapper som returnerar DataURL */
export function compressImage(file, maxWidth = 1200, quality = 0.82) {
  return compressImageToBlob(file, maxWidth, quality).then(({ dataUrl }) => dataUrl);
}
