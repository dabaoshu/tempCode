import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'tailwindcss/tailwind.css';
const root = createRoot(document.getElementById('app'))
console.log(root);
root.render(<App />);
