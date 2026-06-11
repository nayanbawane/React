
import { Provider } from 'react-redux';
import App from './app/App';
import { store } from './app/store/store';
import './styles/globals.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import gwtBridgeInstance from './core/utils/gwt-bridge';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);