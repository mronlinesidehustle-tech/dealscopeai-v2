
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('App starting...');
console.log('Environment check:', {
  NODE_ENV: import.meta.env.MODE,
  VITE_API_KEY: import.meta.env.VITE_API_KEY ? 'Set' : 'Not set'
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

console.log('Root element found, creating React root...');
const root = ReactDOM.createRoot(rootElement);

console.log('Rendering App component...');
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('App render complete');
