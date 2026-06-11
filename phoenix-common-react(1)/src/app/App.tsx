import { setupInterceptors } from '@/core/api/interceptors';
import AppRouter from './routes';
import { initializeGwtTokenBridge } from '@/core/auth/tokenBridge';
import { FeatureToggleInitializer } from '@/core/featureToggles';

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
