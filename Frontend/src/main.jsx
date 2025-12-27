import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles.css';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { RoleProvider } from './context/RoleContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <RoleProvider>
        <SocketProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </SocketProvider>
      </RoleProvider>
    </ThemeProvider>
  </React.StrictMode>
);
