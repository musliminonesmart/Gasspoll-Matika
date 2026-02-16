import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

export default defineConfig(({ mode }) => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
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
      // Memastikan process.env.API_KEY tersedia di browser tanpa error "process is not defined"
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || env.VITE_GEMINI_API_KEY || env.API_KEY || ''),
    },
  };
});