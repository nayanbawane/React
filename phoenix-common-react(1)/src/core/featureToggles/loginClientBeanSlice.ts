import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { LoginClientBeanRaw } from './loginClientBean.types';
import { fetchLoginClientBean } from './featureToggle.service';

export interface LoginClientBeanState {
  data: LoginClientBeanRaw | null;
  isLoaded: boolean;
}

const initialState: LoginClientBeanState = { data: null, isLoaded: false };

export const loadLoginClientBean = createAsyncThunk(
  'loginClientBean/load',
  async () => fetchLoginClientBean()
);

const loginClientBeanSlice = createSlice({
  name: 'loginClientBean',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadLoginClientBean.fulfilled, (state, action) => {
      state.data = action.payload;
      state.isLoaded = true;
    });
  },
});

export default loginClientBeanSlice.reducer;
