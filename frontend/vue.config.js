const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
	productionSourceMap: false,
  publicPath: '/',
	devServer: {
    proxy: {
      "^/api": {
        target: "http://" + process.env.HOST + ":8080"
      },
      "^/public": {
        target: "http://" + process.env.HOST + ":8080"
      }
    },
    host: process.env.HOST,
    port: process.env.PORT
  },
  transpileDependencies: true
})
