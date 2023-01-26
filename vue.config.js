const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  css: {
    loaderOptions: {
      sass: {
        additionalData: `
          @import "@/assets/layout.scss";
          @import "@/assets/animations/fade.scss";
          @import "@/assets/animations/slide-fade.scss";
        `
      }
    }
  }
})
