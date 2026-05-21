import { useState, useCallback } from 'react';
import { exportAsPNG, exportAsPDF, exportViaCloud, shareViaWebShare } from '../lib/exportUtils';

export const PREVIEW_ELEMENT_ID = 'studio-preview-paper';

export function useExport({ format = 'A4', cloudEnabled = true, yardName = 'manadsblad' }) {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [exportSuccess, setExportSuccess] = useState('');

  const filename = yardName.toLowerCase().replace(/\s+/g, '-');

  const run = useCallback(async (fn) => {
    setExporting(true);
    setExportError('');
    setExportSuccess('');
    try {
      await fn();
      setExportSuccess('Export klar!');
      setTimeout(() => setExportSuccess(''), 3000);
    } catch (e) {
      console.error('[Export]', e);
      setExportError(e.message || 'Okänt exportfel.');
      setTimeout(() => setExportError(''), 5000);
    } finally {
      setExporting(false);
    }
  }, []);

  const downloadPNG   = useCallback(() => run(() => exportAsPNG(PREVIEW_ELEMENT_ID, `${filename}.png`)), [run, filename]);
  const downloadPDF   = useCallback(() => run(() => exportAsPDF(PREVIEW_ELEMENT_ID, format, `${filename}.pdf`)), [run, filename, format]);
  const cloudExport   = useCallback(() => {
    if (!cloudEnabled) { setExportError('Moln-export är inaktiverad i inställningarna.'); return; }
    const html = document.getElementById(PREVIEW_ELEMENT_ID)?.outerHTML ?? '';
    return run(() => exportViaCloud(html, format, `${filename}.pdf`));
  }, [run, cloudEnabled, format, filename]);
  const webShare = useCallback(() => run(() => shareViaWebShare(PREVIEW_ELEMENT_ID)), [run]);

  return { exporting, exportError, exportSuccess, downloadPNG, downloadPDF, cloudExport, webShare };
}
