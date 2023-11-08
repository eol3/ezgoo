import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '64.111.98.77',
  	port: '8081',
  	proxy: {
      '/api': {
        target: "http://64.111.98.77:8080"
      },
  	}
  },
})
