import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { StyledEngineProvider } from '@mui/material';
import App from './app/App';
import { store } from './app/store/store';
import './styles/globals.css';
import { StatusProvider } from './context/statusContext';
import { LocationProvider } from './context/locatioContext';
import { gwtBridgeInstance } from 'phoenix-common-react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <LocationProvider>
        <StatusProvider>
          <Provider store={store}>
            <App />
          </Provider>
        </StatusProvider>
      </LocationProvider>
    </StyledEngineProvider>
  </React.StrictMode>
);
