/**
 * React Application Entry Point
 * 
 * This file serves as the main entry point for the React application.
 * It initializes the React DOM, creates the root container, and renders
 * the main App component into the HTML document.
 */

// Import React library for JSX and component functionality
import React from 'react';

// Import ReactDOM client for React 18+ rendering capabilities
import ReactDOM from 'react-dom/client';

// Import the main App component that contains the application logic
import App from './App';

// Create React root container targeting the 'root' div in public/index.html
// This is the React 18+ way of initializing the application
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application into the DOM
// StrictMode enables additional checks and warnings for development
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
