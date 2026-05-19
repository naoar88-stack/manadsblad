export default function SyncStatus({ sync, hasAiKey }) {
  const saveText = !sync.hasCloud
    ? 'Lokalt läge'
    : sync.syncStatus === 'saving'
      ? 'Sparar...'
      : sync.syncStatus === 'saved'
        ? 'Sparat'
        : sync.syncStatus === 'error'
          ? 'Syncfel'
          : 'Redo';

  return (
    <div className="sync-status">
      <div className="status-chip">{saveText}</div>
      <div className={`status-chip ${hasAiKey ? 'status-chip-active' : ''}`}>
        {hasAiKey ? 'AI aktiv' : 'AI fallback'}
      </div>
    </div>
  );
}
