import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RawFeatureToggleConfig, ResolvedToggles } from './featureToggle.types';
import { fetchFeatureToggles } from './featureToggle.service';
import { resolveToggles } from './featureToggle.utils';

export interface FeatureToggleState {
  resolved: ResolvedToggles;
  raw: RawFeatureToggleConfig;
  isLoaded: boolean;
}

const initialState: FeatureToggleState = { resolved: {}, raw: {}, isLoaded: false };

export const loadFeatureToggles = createAsyncThunk(
  'featureToggle/load',
  async () => {
    const raw = await fetchFeatureToggles();
    return { resolved: resolveToggles(raw), raw };
  }
);

export interface SetTogglesPayload {
  resolved: ResolvedToggles;
  raw: RawFeatureToggleConfig;
}

const featureToggleSlice = createSlice({
  name: 'featureToggle',
  initialState,
  reducers: {
    setToggles(state, action: PayloadAction<SetTogglesPayload>) {
      state.resolved = action.payload.resolved;
      state.raw = action.payload.raw;
      state.isLoaded = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadFeatureToggles.fulfilled, (state, action) => {
        state.resolved = action.payload.resolved;
        state.raw = action.payload.raw;
        state.isLoaded = true;
      })
      .addCase(loadFeatureToggles.rejected, (state) => {
        state.isLoaded = true;
      });
  },
});

export const { setToggles } = featureToggleSlice.actions;
export default featureToggleSlice.reducer;
