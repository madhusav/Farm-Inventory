import { createRoot } from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './i18n/LanguageContext';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for offline caching in rural farm areas
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);
