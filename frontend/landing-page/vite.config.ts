import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@kakraba/shared': path.resolve(__dirname, '../packages/shared/src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Performance optimizations
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
  },
  server: {
    port: 3000,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
