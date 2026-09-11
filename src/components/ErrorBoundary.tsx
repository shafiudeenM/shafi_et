import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });

    // Forward to Sentry in production
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      import('@sentry/react').then((Sentry) => {
        if (typeof Sentry?.captureException === 'function') {
          Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack ?? '' } } });
        }
      }).catch(() => { /* Sentry not available — swallow */ });
    } catch { /* guard */ }

    // Log error to console in development
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV) {
      console.group('ErrorBoundary Details');
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onReset?.();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-[#121212] border border-[#262626] rounded-2xl p-8 text-center shadow-2xl">
            <div className="inline-flex p-3 rounded-2xl bg-red-500/15 text-red-400 mb-4 border border-red-500/30">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h2 className="text-lg font-serif font-bold text-white mb-2">
              {this.props.fallbackTitle || 'ஏதோ தவறு நடந்தது / Something went wrong'}
            </h2>

            <p className="text-xs text-[#a3a3a3] mb-6 leading-relaxed">
              {this.props.fallbackMessage ||
                'இந்த பகுதியில் பிழை ஏற்பட்டது. கவலை வேண்டாம், உங்கள் தரவு பாதுகாப்பாக உள்ளது. மீண்டும் முயற்சிக்கவும்.'}
              <br />
              <span className="text-[#8f8f8f]">
                This section encountered an error. Your data is safe. Please try again.
              </span>
            </p>

            {typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV && this.state.error && (
              <details className="mb-4 text-left">
                <summary className="text-[10px] text-[#8f8f8f] cursor-pointer hover:text-white transition">
                  பிழை விவரங்கள் / Error Details (Dev)
                </summary>
                <pre className="mt-2 p-3 bg-[#0a0a0a] rounded-lg text-[10px] text-red-400 overflow-auto max-h-40 border border-[#262626]">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#181818] border border-[#333] text-xs font-bold text-[#d4d4d4] hover:bg-[#262626] transition"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>மீண்டும் முயற்சி / Retry</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d4b068] text-[#0a0a0a] font-bold text-xs shadow-lg shadow-[#c5a059]/20 transition"
              >
                <Home className="w-3.5 h-3.5" />
                <span>முகப்பு / Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
