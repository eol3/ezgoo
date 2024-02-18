import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
        {find: "@", replacement: path.resolve(__dirname, 'src')}
    ],
  },
  plugins: [vue()],
  server: {
    host: 'localhost',
  	port: '8081',
  	proxy: {
      '/api': {
        target: "http://64.111.98.77:8080"
      },
  	}
  },
  build: {
    target: 'es2020',
    polyfillModulePreload: false
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/assets/global.scss";
        `
      }
    }
  },
})
