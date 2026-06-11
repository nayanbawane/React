import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loadFeatureToggles, setToggles } from './featureToggleSlice';
import { loadLoginClientBean } from './loginClientBeanSlice';
import { onTogglesReceived } from '../auth/tokenBridge';
import { resolveToggles } from './featureToggle.utils';

export function FeatureToggleInitializer() {
  const dispatch = useDispatch<any>();

  useEffect(() => {
    dispatch(loadLoginClientBean());
    dispatch(loadFeatureToggles());

    const unsubscribe = onTogglesReceived((raw) => {
      dispatch(setToggles({ resolved: resolveToggles(raw), raw }));
    });

    return unsubscribe;
  }, [dispatch]);

  return null;
}
