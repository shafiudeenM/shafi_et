import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App.tsx';
import './index.css';
import './services/pwaService';

// ---------- Sentry Client Init ----------
const sentryDsn = (import.meta.env.VITE_SENTRY_DSN as string | undefined) || '';

if (sentryDsn && !import.meta.env.DEV) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        maskAllInputs: true,
      }),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary
      fallback={<p style={{ padding: '2rem', textAlign: 'center' }}>Something went wrong. Please reload.</p>}
    >
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
);

