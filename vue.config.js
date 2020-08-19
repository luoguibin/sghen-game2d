module.exports = {
  lintOnSave: true,
  runtimeCompiler: true,
  publicPath: './',

  productionSourceMap: false,
  filenameHashing: true,

  css: {
    extract: true,
    sourceMap: false
  },

  devServer: {
    port: 8080,
    disableHostCheck: true,
    host: '0.0.0.0',
    open: false
  }
}
