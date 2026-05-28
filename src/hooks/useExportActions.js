import { useRef, useState } from 'react';
import { exportAsPNG, exportAsPDF } from '../lib/exportUtils';
import { getMonthName } from '../lib/dateUtils';

// Hjälpfunktion: mappa formatnycklar till korta filnamnssuffix
function formatSuffix(format) {
  const map = {
    'a4-landscape':   'a4-liggande',
    'a4-portrait':    'a4-stående',
    'instagram-post': 'ig-post',
    'instagram-story': 'ig-story',
  };
  return map[format] || format;
}

export function useExportActions(state) {
  const exportRef = useRef(null);
  const [isExporting, setIsExporting]   = useState(false);
  const [exportError, setExportError]   = useState('');
  const [exportSuccess, setExportSuccess] = useState('');
  const [lastExportType, setLastExportType] = useState('');

  const getBaseFilename = () => {
    const month = (typeof getMonthName === 'function'
      ? getMonthName(state.selectedMonth)
      : String(state.selectedMonth + 1).padStart(2, '0')
    ).toLowerCase();
    const title = (state.headerTitle || 'manadsblad')
      .toLowerCase()
      .replace(/[^a-z0-9åäö]+/gi, '-')
      .replace(/^-|-$/g, '');
    const suffix = formatSuffix(state.selectedFormat);
    return `${title || 'manadsblad'}-${month}-${state.selectedYear}-${suffix}`;
  };

  const runExport = async (type, action) => {
    if (!exportRef.current) {
      setExportError('Export-element är inte monterat.');
      return;
    }
    setIsExporting(true);
    setExportError('');
    setExportSuccess('');
    setLastExportType(type);
    try {
      const filename = await action();
      setExportSuccess(`${type} exporterad: ${filename}`);
      window.setTimeout(() => setExportSuccess(''), 3200);
    } catch (error) {
      setExportError(error?.message || `Kunde inte exportera ${type}.`);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadPng = () => runExport('PNG', async () => {
    const filename = `${getBaseFilename()}.png`;
    // exportAsPNG tar ett element-id; vi sätter ett tillfälligt id om nödvändigt
    const el = exportRef.current;
    const tempId = '__export_ref_target__';
    const prevId = el.id;
    if (!el.id) el.id = tempId;
    try {
      await exportAsPNG(el.id, filename);
    } finally {
      el.id = prevId;
    }
    return filename;
  });

  const downloadPdf = () => runExport('PDF', async () => {
    const filename = `${getBaseFilename()}.pdf`;
    const el = exportRef.current;
    const tempId = '__export_ref_target__';
    const prevId = el.id;
    if (!el.id) el.id = tempId;
    try {
      await exportAsPDF(el.id, state.selectedFormat, filename);
    } finally {
      el.id = prevId;
    }
    return filename;
  });

  return {
    exportRef,
    isExporting,
    exportError,
    exportSuccess,
    lastExportType,
    downloadPng,
    downloadPdf,
  };
}
