const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: [
    'vuetify'
  ],
  lintOnSave: false,
  productionSourceMap: false, // Deshabilita los mapas de origen en producción
  configureWebpack: {
    devtool: 'source-map', // Asegura que los mapas de origen se generen en desarrollo
  },
})
