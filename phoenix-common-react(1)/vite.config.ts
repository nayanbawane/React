import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/app': path.resolve(__dirname, './src/app'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/core': path.resolve(__dirname, './src/core'),
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    open: true,
    proxy: {
      '/phoenix': {
        target: 'http://localhost:8081', //This is devtunnel, add the actual API domain
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'phoenix-common-react',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : 'cjs'}.js`,
    },
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-dom',
        'react-redux',
        'react-router-dom',
        '@reduxjs/toolkit',
        '@emotion/react',
        '@emotion/styled',
        '@mui/material',
        '@react-google-maps/api',
        '@uiw/react-baidu-map',
        'lucide-react',
        'phoenix-react-lib',
        'pdfjs-dist',
        'pdfjs-dist/build/pdf.worker.min.mjs',
      ],
    },
  },
});
