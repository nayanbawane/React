import AppRouter from './routes';
import { setupInterceptors } from '@/core/api/interceptors';
import { initializeGwtTokenBridge } from '@/core/auth/tokenBridge';
import { FeatureToggleInitializer } from 'phoenix-common-react';

// Initialize iframe token bridge before interceptors.
initializeGwtTokenBridge();
setupInterceptors();

function App() {
  return (
    <>
      <FeatureToggleInitializer />
      <AppRouter />
    </>
  );
}

export default App;
