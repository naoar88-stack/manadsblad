import { AlertTriangle, CheckCircle2, Download, FileText, Sparkles } from 'lucide-react';
import { getMonthName } from '../lib/dateUtils';

export default function PreviewHeader({ state, ai, exportActions }) {
  const handleImproveAll = async () => {
    for (const day of state.days) {
      if (!day.text.trim()) continue;
      // eslint-disable-next-line no-await-in-loop
      await ai.improveTextForDay(day);
    }
  };

  return (
    <div>
      <div className="preview-header">
        <div>
          <h2 className="preview-title">{state.headerTitle}</h2>
          <p className="preview-subtitle">
            {getMonthName(state.selectedMonth)} {state.selectedYear}
          </p>
        </div>

        <div className="top-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleImproveAll}
          >
            <Sparkles size={16} /> Förbättra alla texter
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={exportActions.downloadPdf}
            disabled={exportActions.isExporting}
          >
            <FileText size={16} />{' '}
            {exportActions.isExporting && exportActions.lastExportType === 'PDF'
              ? 'Exporterar PDF...'
              : 'PDF'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={exportActions.downloadPng}
            disabled={exportActions.isExporting}
          >
            <Download size={16} />{' '}
            {exportActions.isExporting && exportActions.lastExportType === 'PNG'
              ? 'Exporterar PNG...'
              : 'PNG'}
          </button>
        </div>
      </div>

      {exportActions.exportSuccess && (
        <div className="ai-success-banner" role="status">
          <CheckCircle2 size={16} /> {exportActions.exportSuccess}
        </div>
      )}

      {exportActions.exportError && (
        <div className="ai-error-banner" role="alert">
          <AlertTriangle size={16} /> {exportActions.exportError}
        </div>
      )}

      {ai.lastError && (
        <div className="ai-error-banner" role="alert">
          <AlertTriangle size={16} /> {ai.lastError}
        </div>
      )}
    </div>
  );
}
