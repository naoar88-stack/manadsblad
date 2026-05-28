import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { exportAsPNG, exportAsPDF, exportViaCloud, shareViaWebShare } from '../lib/exportUtils';

export const EXPORT_ELEMENT_ID = 'export-canvas-root';

export function useExport({ format = 'a4-portrait', cloudEnabled = true, yardName = 'manadsblad' }) {
  const [exporting,      setExporting]      = useState(false);
  const [exportError,    setExportError]    = useState('');
  const [exportSuccess,  setExportSuccess]  = useState('');

  // Guard mot state-uppdateringar efter unmount
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const filename = useMemo(
    () => yardName.toLowerCase().replace(/\s+/g, '-'),
    [yardName],
  );

  const run = useCallback(async (fn, successMsg) => {
    setExporting(true);
    setExportError('');
    setExportSuccess('');
    try {
      await fn();
      if (!isMounted.current) return;
      setExportSuccess(successMsg);
      const t = setTimeout(() => { if (isMounted.current) setExportSuccess(''); }, 3500);
      return () => clearTimeout(t);
    } catch (e) {
      console.error('[Export]', e);
      if (!isMounted.current) return;
      setExportError(e.message || 'Okänt exportfel — försök igen.');
      const t = setTimeout(() => { if (isMounted.current) setExportError(''); }, 5000);
      return () => clearTimeout(t);
    } finally {
      if (isMounted.current) setExporting(false);
    }
  }, []);

  const downloadPNG = useCallback(
    () => run(
      () => exportAsPNG(EXPORT_ELEMENT_ID, `${filename}.png`),
      `✓ PNG nedladdad — ${filename}.png`,
    ),
    [run, filename],
  );

  const downloadPDF = useCallback(
    () => run(
      () => exportAsPDF(EXPORT_ELEMENT_ID, format, `${filename}.pdf`),
      `✓ PDF skapad — ${filename}.pdf`,
    ),
    [run, filename, format],
  );

  const cloudExport = useCallback(() => {
    if (!cloudEnabled) {
      setExportError('Molnexport är inaktiverad i inställningarna.');
      return;
    }
    const html = document.getElementById(EXPORT_ELEMENT_ID)?.outerHTML ?? '';
    return run(
      () => exportViaCloud(html, format, `${filename}.pdf`),
      '✓ Uppladdad till molnet',
    );
  }, [run, cloudEnabled, format, filename]);

  const webShare = useCallback(
    () => run(
      () => shareViaWebShare(EXPORT_ELEMENT_ID),
      '✓ Delning öppnad',
    ),
    [run],
  );

  return { exporting, exportError, exportSuccess, downloadPNG, downloadPDF, cloudExport, webShare };
}
