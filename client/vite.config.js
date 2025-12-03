import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || 'http://localhost:3001'
  
  console.log('🔧 Vite Proxy Configuration:')
  console.log('   Mode:', mode)
  console.log('   VITE_API_URL from env:', env.VITE_API_URL)
  console.log('   Proxy target:', apiUrl)
  
  return {
    plugins: [react()],
    server: {
      historyApiFallback: true,
      proxy: {
        '/api': {
          // Use environment variable or default to localhost for development
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
