import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { AppStateProvider } from './hooks/useAppState';
import { registerServiceWorker } from './registerServiceWorker';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/print.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('SaathiSetu could not start: the #root element is missing from index.html');
}

createRoot(container).render(
  <StrictMode>
    <AppStateProvider>
      <App />
    </AppStateProvider>
  </StrictMode>,
);

registerServiceWorker();
