import { useSelector } from 'react-redux';
import {
  selectResolved,
  selectRaw,
  selectIsLoaded,
} from '../../core/featureToggles/featureToggle.selectors';
import {
  isEnabled,
  isUserEnabled,
  isLocationEnabled,
  getToggleValue,
} from '../../core/featureToggles/featureToggle.utils';
import type { ToggleKey } from '../../core/featureToggles/featureToggle.types';

export interface FeatureToggleHook {
  isVisible: (key: ToggleKey) => boolean;
  isMandatory: (key: ToggleKey) => boolean;
  isUserEnabled: (key: ToggleKey) => boolean;
  isLocationEnabled: (location: string, key: ToggleKey) => boolean;
  getToggleValue: (key: ToggleKey) => string | undefined;
  isLoaded: boolean;
}

export function useFeatureToggle(): FeatureToggleHook {
  const resolved = useSelector(selectResolved);
  const raw = useSelector(selectRaw);
  const isLoaded = useSelector(selectIsLoaded);

  return {
    isVisible: (key) => isEnabled(resolved, key),
    isMandatory: (key) => isEnabled(resolved, key),
    isUserEnabled: (key) => isUserEnabled(raw, key),
    isLocationEnabled: (location, key) => isLocationEnabled(raw, location, key),
    getToggleValue: (key) => getToggleValue(resolved, key),
    isLoaded,
  };
}
