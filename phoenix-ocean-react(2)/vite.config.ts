import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    dedupe: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@emotion/react',
      '@emotion/styled',
      '@mui/material',
    ],
    alias: {
      // Force single instance of critical packages
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      '@emotion/react': path.resolve(__dirname, 'node_modules/@emotion/react'),
      '@emotion/styled': path.resolve(__dirname, 'node_modules/@emotion/styled'),
      '@mui/material': path.resolve(__dirname, 'node_modules/@mui/material'),

      // Your existing aliases
      '@': path.resolve(__dirname, './src'),
      '@/app': path.resolve(__dirname, './src/app'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/core': path.resolve(__dirname, './src/core'),
      'phoenix-common-react': path.resolve(
        __dirname,
        '../phoenix-common-react/src'
      ),
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    open: true,
    proxy: {
      '/phoenix/1.0':{
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/phoenix/1.0/booking': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/phoenix/1.0/tms': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/phoenix': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.split(path.sep).join('/');

          if (
            normalizedId.includes('/phoenix-common-react/src/index.ts') ||
            normalizedId.includes('/phoenix-common-react/src/app/slices/LCL/Booking/bookingSlice.ts') ||
            normalizedId.includes('/phoenix-common-react/src/features/LCL/Components/BookingMainDetails/')
          ) {
            return 'phoenix-common-booking';
          }
        },
      },
    },
  },
});
