import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { I18nProvider } from './lib/i18n.jsx';
import { StudioProvider } from './lib/studio.jsx';
import App from './App.jsx';
import './styles/global.css';

const BASENAME = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={BASENAME}>
      <StudioProvider>
        <I18nProvider>
          <App />
        </I18nProvider>
      </StudioProvider>
    </BrowserRouter>
  </React.StrictMode>
);
