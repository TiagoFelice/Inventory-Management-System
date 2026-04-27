import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const isDockerBuild = process.env.VITE_BUILD_TARGET === 'docker';

  return {
  base: command === 'build' && isDockerBuild ? '/static/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@app': path.resolve(__dirname, './src/app'),
      '@features': path.resolve(__dirname, './src/features'),
      '@components': path.resolve(__dirname, './src/components'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@lib': path.resolve(__dirname, './src/lib'),
    },
  },
  build: {
    outDir: isDockerBuild ? '../backend/frontend_dist' : 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
  };
});
