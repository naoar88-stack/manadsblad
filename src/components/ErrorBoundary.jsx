import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * ErrorBoundary
 * Fångar JavaScript-fel i komponentträdet och visar ett
 * återhämtningsbart felmeddelande istället för vit skärm.
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
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Logga till konsolen i dev; byt ut mot Sentry/Logtail i produktion
    console.error('[ErrorBoundary] Ohanterat fel:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    // Anpassat fallback om props.fallback skickas in
    if (this.props.fallback) return this.props.fallback;

    // Standard-felvy
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
            Något gick fel
          </p>
          <p
            style={{
              fontSize: 13,
              color: '#64748b',
              maxWidth: 360,
              lineHeight: 1.6,
            }}
          >
            {this.state.error?.message || 'Ett oväntat fel inträffade.'}
          </p>
        </div>

        <button
          onClick={this.handleReset}
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
          Försök igen
        </button>
      </div>
    );
  }
}
