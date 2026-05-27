import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const { error, info } = this.state;
    const isChunkError = error?.message?.includes('Failed to fetch dynamically imported module')
      || error?.message?.includes('Loading chunk');

    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center space-y-6">

          {/* Ikon */}
          <div className="w-20 h-20 mx-auto rounded-3xl bg-red-50 border border-red-100 flex items-center justify-center shadow-sm">
            <AlertTriangle size={32} className="text-red-500" />
          </div>

          {/* Rubrik */}
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isChunkError ? 'Ny version tillgänglig' : 'Något gick fel'}
            </h1>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              {isChunkError
                ? 'Appen har uppdaterats. Ladda om sidan för att hämta den senaste versionen.'
                : 'Ett oväntat fel uppstod. Försök ladda om sidan.'}
            </p>
          </div>

          {/* Felmeddelande (kollapsibelt) */}
          {!isChunkError && error?.message && (
            <details className="text-left bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
              <summary className="px-4 py-3 text-xs font-bold text-slate-500 cursor-pointer hover:bg-slate-100 transition">
                Teknisk detalj
              </summary>
              <div className="px-4 pb-3">
                <code className="text-xs text-red-600 font-mono break-all leading-relaxed">
                  {error.message}
                </code>
                {info?.componentStack && (
                  <pre className="text-[10px] text-slate-400 mt-2 overflow-auto max-h-32 leading-relaxed">
                    {info.componentStack.trim()}
                  </pre>
                )}
              </div>
            </details>
          )}

          {/* Knappar */}
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="btn-primary flex-1 h-12 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2">
              <RefreshCw size={15} /> Ladda om
            </button>
            <button
              onClick={() => this.setState({ hasError: false, error: null, info: null })}
              className="flex-1 h-12 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition">
              <Home size={15} /> Försök igen
            </button>
          </div>

        </div>
      </div>
    );
  }
}
