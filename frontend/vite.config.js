import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};
  
  return defineConfig({
    resolve: {
      alias: [
          {find: "@", replacement: path.resolve(__dirname, 'src')}
      ],
    },
    plugins: [vue()],
    server: {
      host: process.env.VITE_HOST,
    	port: process.env.VITE_PORT,
      // allowedHosts: ['test.ezgoo.biz'],
      // hmr: { host: "test.ezgoo.biz", protocol: 'wss' },
    	proxy: {
        '/api': {
          target: process.env.VITE_API_URL
        }
        // '/uploads': {
        //   target: process.env.VITE_API_URL
        // }
    	}
    },
    build: {
      target: 'es2020',
      modulePreload: {
        polyfill: false
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/assets/_variables.scss";`
        }
      }
    },
  })
}
