const CLOUD_NAME = 'difduyste';
const UPLOAD_PRESET = 'Fritid';
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/**
 * Laddar upp en Blob/File till Cloudinary via unsigned upload.
 * Returnerar den säkra HTTPS-URL:en till den uppladdade bilden.
 */
export async function uploadToCloudinary(blob, filename = 'upload') {
  const formData = new FormData();
  formData.append('file', blob, filename);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'manadsblad');

  const response = await fetch(UPLOAD_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Cloudinary-fel: ${response.status}`);
  }

  const data = await response.json();
  return {
    url: data.secure_url,
    publicId: data.public_id,
  };
}
