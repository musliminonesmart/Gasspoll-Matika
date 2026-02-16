import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

export default defineConfig(({ mode }) => {
  // Fix: Define __dirname manually as it is not available in ESM environments
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, path.resolve('.'), '');

  // Prioritas API Key: 
  // 1. Environment Variable Vercel (process.env.API_KEY)
  // 2. File .env lokal
  // 3. Fallback Hardcoded (sesuai request Anda agar langsung jalan)
  const apiKey = process.env.API_KEY || env.VITE_GEMINI_API_KEY || env.API_KEY || 'AlzaSyAfEHoHlK0e23KROcpO_pfsW2fSZ23f71U';

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
      // Menyuntikkan API Key ke dalam kode klien
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
  };
});