import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'tailwindcss/tailwind.css';
import { PositionStoreProvider } from './context';
const root = createRoot(document.getElementById('app'))
root.render(
  <PositionStoreProvider>
    <App />
  </PositionStoreProvider>
);
