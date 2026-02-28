import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  // Removing React.StrictMode to prevent the immediate double mount
  // which can disrupt the camera stream initialization or MediaPipe setup in some environments
  <App />
);
