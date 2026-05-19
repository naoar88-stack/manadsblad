import { useRef, useState } from 'react';
import { exportAsPdf, exportAsPng, getExportFormatPreset } from '../lib/exportUtils';
import { getMonthName } from '../lib/dateUtils';

export function useExportActions(state) {
  const exportRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [exportSuccess, setExportSuccess] = useState('');
  const [lastExportType, setLastExportType] = useState('');

  const getBaseFilename = () => {
    const month = getMonthName(state.selectedMonth).toLowerCase();
    const title = state.headerTitle.toLowerCase().replace(/[^a-z0-9åäö]+/gi, '-').replace(/^-|-$/g, '');
    const preset = getExportFormatPreset(state.selectedFormat);
    return `${title || 'manadsblad'}-${month}-${state.selectedYear}-${preset.suffix}`;
  };

  const runExport = async (type, action) => {
    if (!exportRef.current) return;
    setIsExporting(true);
    setExportError('');
    setExportSuccess('');
    setLastExportType(type);
    try {
      const filename = await action();
      setExportSuccess(`${type} exporterad: ${filename}`);
      if (typeof window !== 'undefined') {
        window.setTimeout(() => setExportSuccess(''), 3200);
      }
    } catch (error) {
      setExportError(error?.message || `Kunde inte exportera ${type}.`);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadPng = async () => runExport('PNG', async () => {
    const filename = `${getBaseFilename()}.png`;
    await exportAsPng(exportRef.current, filename);
    return filename;
  });

  const downloadPdf = async () => runExport('PDF', async () => {
    const filename = `${getBaseFilename()}.pdf`;
    await exportAsPdf(exportRef.current, state.selectedFormat, filename);
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
