
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode`.
  // Use '.' instead of process.cwd() to avoid TS errors in some environments.
  const env = loadEnv(mode, '.', 'VITE_');

  return {
    base: '/',
    plugins: [react()],
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    resolve: {
      alias: {
        // Use path.resolve('.') as an alternative to avoid dependency on __dirname.
        '@': path.resolve('.'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    define: {
      // Mapping process.env.API_KEY to targets to ensure compatibility
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(process.env.API_KEY),
    },
  };
});
