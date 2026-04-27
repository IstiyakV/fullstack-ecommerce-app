import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env from root project directory (parent of Frontend/)
  const env = loadEnv(mode, '../', ['API_PORT', 'WEB_PORT', 'DATABASE'])
  const apiPort = env.API_PORT || '3000'
  const webPort = parseInt(env.WEB_PORT || '3001')

  return {
    plugins: [react()],
    server: {
      host: true,
      port: webPort,
      proxy: {
        '/api/v1': {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true,
        },
        '/uploads': {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true,
        },
      },
    },
  }
})
