import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './globals.css';
import './output.css';  // Add this line

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);