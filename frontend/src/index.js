import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './globals.css';
import App from './App';

console.log('Starting application...');

const renderApp = () => {
  console.log('Rendering App component');
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

const initApp = async () => {
  if (window.__TAURI__) {
    console.log('Tauri detected, initializing...');
    try {
      const tauri = await import('@tauri-apps/api');
      window.__TAURI__ = tauri;
      console.log('Tauri API loaded');
    } catch (error) {
      console.error('Error loading Tauri API:', error);
    }
  } else {
    console.log('Tauri not detected, running in browser mode');
  }

  renderApp();
};

initApp().catch(error => {
  console.error('Failed to initialize app:', error);
  document.getElementById('root').innerHTML = `
    <div style="color: red; padding: 20px;">
      <h1>Error Initializing App</h1>
      <p>${error.message}</p>
    </div>
  `;
});