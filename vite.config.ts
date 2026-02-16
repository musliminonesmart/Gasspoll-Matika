import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

export default defineConfig(({ mode }) => {
  // Fix: Define __dirname manually as it is not available in ESM environments
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  // Load env file based on `mode` in the current working directory.
  // Using path.resolve('.') as a type-safe way to get the current working directory.
  const env = loadEnv(mode, path.resolve('.'), '');

  return {
    base: '/',
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
    },
    define: {
      // This ensures process.env.API_KEY is available in the browser.
      // We prioritize the actual process.env (from Vercel Dashboard) then falling back to loaded env.
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || env.VITE_GEMINI_API_KEY || env.API_KEY || ''),
    },
  };
});