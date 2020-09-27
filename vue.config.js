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

  // configureWebpack: {
  //   module: {
  //     rules: [
  //       {
  //         test: /\.json$/,
  //         loader: 'url-loader',
  //         options: {
  //           limit: 1,
  //           name: '/static/json/[name].[hash:7].[ext]'
  //         }
  //       }
  //     ]
  //   }
  // },

  chainWebpack: config => {
    config.module
      .rule('images')
      .use('url-loader')
      .loader('url-loader')
      .tap(options => Object.assign(options, { limit: 1 }))
      .end()

    // config.module
    //   .rule('myjson')
    //   .test(/\.json$/)
    //   .use('raw-loader')
    //   .loader('raw-loader')
    //   .options({
    //     limit: 1,
    //     name: `static/json/[name].[hash:7].[ext]`
    //   })
    //   .end()
  },

  devServer: {
    port: 8080,
    disableHostCheck: true,
    host: '0.0.0.0',
    open: false
  }
}
