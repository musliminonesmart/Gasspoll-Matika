import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

export default defineConfig(({ mode }) => {
  // Fix: Define __dirname manually as it is not available in ESM environments
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  // Fix: Cast process to any to bypass the error where 'cwd' is not found on type 'Process'
  const env = loadEnv(mode, (process as any).cwd(), 'VITE_');

  return {
    base: '/',
    plugins: [react()],
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    resolve: {
      alias: {
        // Fix: Use the manually defined __dirname for path resolution
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    define: {
      // Mapping the API Key so it's accessible in the browser context
      'process.env.API_KEY': JSON.stringify((process as any).env.API_KEY || env.VITE_GEMINI_API_KEY || ''),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify((process as any).env.API_KEY || env.VITE_GEMINI_API_KEY || '')
    },
  };
});
