import { createSlice } from '@reduxjs/toolkit';

const normalizeBaseUrl = (url) => (url.endsWith('/') ? url : `${url}/`);

const initialState = {
  baseUrl: normalizeBaseUrl(
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
  ),
};

const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    setBaseUrl: (state, action) => {
      state.baseUrl = action.payload;
    },
  },
});

export const { setBaseUrl } = apiSlice.actions;

export default apiSlice.reducer;
