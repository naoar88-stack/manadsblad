import { AlertTriangle, CheckCircle2, Download, FileText, Sparkles } from 'lucide-react';
import { getMonthName } from '../lib/dateUtils';

export default function PreviewHeader({ state, ai, exportActions }) {
  return (
    <div>
      <div className="preview-header">
        <div>
          <h2 style={{ margin: '0 0 6px' }}>{state.headerTitle}</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            {getMonthName(state.selectedMonth)} {state.selectedYear}
          </p>
        </div>

        <div className="top-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={async () => {
              for (const day of state.days) {
                if (!day.text.trim()) continue;
                await ai.improveTextForDay(day);
              }
            }}
          >
            <Sparkles size={16} /> Förbättra alla texter
          </button>
          <button type="button" className="btn btn-secondary" onClick={exportActions.downloadPdf} disabled={exportActions.isExporting}>
            <FileText size={16} /> {exportActions.isExporting && exportActions.lastExportType === 'PDF' ? 'Exporterar PDF...' : 'PDF'}
          </button>
          <button type="button" className="btn btn-primary" onClick={exportActions.downloadPng} disabled={exportActions.isExporting}>
            <Download size={16} /> {exportActions.isExporting && exportActions.lastExportType === 'PNG' ? 'Exporterar PNG...' : 'PNG'}
          </button>
        </div>
      </div>

      {exportActions.exportSuccess && (
        <div className="ai-success-banner">
          <CheckCircle2 size={16} /> {exportActions.exportSuccess}
        </div>
      )}

      {exportActions.exportError && (
        <div className="ai-error-banner">
          <AlertTriangle size={16} /> {exportActions.exportError}
        </div>
      )}

      {ai.lastError && (
        <div className="ai-error-banner">
          <AlertTriangle size={16} /> {ai.lastError}
        </div>
      )}
    </div>
  );
}
