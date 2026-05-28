import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * ErrorBoundary
 * Fångar JavaScript-fel i komponentträdet och visar ett
 * återhämtningsbart felmeddelande istället för vit skärm.
 *
 * Chunk-fel (dynamiska importer som misslyckas efter ny deploy):
 *   Identifieras via "Failed to fetch dynamically imported module" i felmeddelandet.
 *   Sidan laddas om automatiskt EN gång (sessionStorage-flagga förhindrar loop).
 *
 * Användning:
 *   <ErrorBoundary>
 *     <MinKomponent />
 *   </ErrorBoundary>
 *
 *   <ErrorBoundary fallback={<EgetFelUI />}>
 *     <MinKomponent />
 *   </ErrorBoundary>
 */

const CHUNK_ERROR_PATTERNS = [
  'Failed to fetch dynamically imported module',
  'Importing a module script failed',
  'error loading dynamically imported module',
  'ChunkLoadError',
];

function isChunkError(error) {
  const msg = error?.message || '';
  return CHUNK_ERROR_PATTERNS.some(p => msg.includes(p));
}

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, isChunkError: false };
  }

  static getDerivedStateFromError(error) {
    const chunkErr = isChunkError(error);

    // Auto-reload vid chunk-fel — max en gång per session för att undvika loop
    if (chunkErr && !sessionStorage.getItem('chunk_reload_attempted')) {
      sessionStorage.setItem('chunk_reload_attempted', '1');
      window.location.reload();
      // Returnera state ändå — reload är async, render kan hinna köras
    }

    return { hasError: true, error, isChunkError: chunkErr };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Ohanterat fel:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, isChunkError: false });
  };

  handleReload = () => {
    sessionStorage.removeItem('chunk_reload_attempted');
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    const { isChunkError: isChunk, error } = this.state;

    return (
      <div
        role="alert"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '1rem',
          padding: '2rem',
          color: '#475569',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: '#fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={28} color="#d97706" />
        </div>

        <div>
          <p style={{ fontWeight: 700, fontSize: 16, color: '#1e293b', marginBottom: 6 }}>
            {isChunk ? 'Ny version tillgänglig' : 'Något gick fel'}
          </p>
          <p
            style={{
              fontSize: 13,
              color: '#64748b',
              maxWidth: 360,
              lineHeight: 1.6,
            }}
          >
            {isChunk
              ? 'Appen har uppdaterats. Ladda om sidan för att fortsätta.'
              : (error?.message || 'Ett oväntat fel inträffade.')}
          </p>
        </div>

        <button
          onClick={isChunk ? this.handleReload : this.handleReset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 18px',
            borderRadius: 10,
            border: 'none',
            background: '#0f172a',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} />
          {isChunk ? 'Ladda om' : 'Försök igen'}
        </button>
      </div>
    );
  }
}
