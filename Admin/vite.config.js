import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // Load env from root project directory (parent of Admin/)
  const env = loadEnv(mode, '../', ['API_PORT', 'ADMIN_PORT'])
  const apiPort = env.API_PORT || '3000'
  const adminPort = env.ADMIN_PORT || '5173'

  return {
    plugins: [react(), tailwindcss()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      host: true,
      port: Number(adminPort),
      proxy: {
        '/api': `http://localhost:${apiPort}`,
        '/uploads': `http://localhost:${apiPort}`,
      },
    },
  };
});
