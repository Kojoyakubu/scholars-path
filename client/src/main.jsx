import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { store } from './app/store';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles'; // Import only ThemeProvider
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme'; // ✅ Import your new theme

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}> {/* ✅ Use your new theme */}
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);