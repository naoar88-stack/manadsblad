import Sidebar from './components/Sidebar';
import CalendarEditor from './components/CalendarEditor';
import PreviewHeader from './components/PreviewHeader';
import SyncStatus from './components/SyncStatus';
import AssetLibraryPanel from './components/AssetLibraryPanel';
import ExportCanvas from './components/ExportCanvas';
import { useMonthPlan } from './hooks/useMonthPlan';
import { useFirebaseSync } from './hooks/useFirebaseSync';
import { useAssetLibrary } from './hooks/useAssetLibrary';
import { useAiActions } from './hooks/useAiActions';
import { useExportActions } from './hooks/useExportActions';

export default function App() {
  const state = useMonthPlan();
  const sync = useFirebaseSync(state);
  const library = useAssetLibrary(sync, state);
  const ai = useAiActions(state);
  const exportActions = useExportActions(state);

  return (
    <div className="app-shell">
      <Sidebar state={state} />
      <main className="main">
        <div className="status-row">
          <SyncStatus sync={sync} hasAiKey={Boolean(state.geminiApiKey)} />
        </div>
        <PreviewHeader state={state} ai={ai} exportActions={exportActions} />
        <CalendarEditor
          days={state.days}
          updateActivity={state.updateActivity}
          openLibrary={library.setSelectedDateKey}
          ai={ai}
        />
        <ExportCanvas state={state} exportRef={exportActions.exportRef} />
        <div className="footer-note">{state.footerText}</div>
      </main>
      <AssetLibraryPanel library={library} />
    </div>
  );
}
