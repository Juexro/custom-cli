const HtmlWebpackPlugin = require('html-webpack-plugin')
const process = require('process')
const path = require('path')

module.exports = function (configs) {
  const {mode, pages} = configs
  if (mode === 'development') {
    return pages.map(page => {
      return new HtmlWebpackPlugin({
        ...page,
        template: path.resolve(process.cwd(), page.template)
      })
    })
  } else {
    return pages.map(page => {
      return new HtmlWebpackPlugin({
        ...page,
        template: path.resolve(process.cwd(), page.template),
        chunks: [...page.chunks, ...configs.suffixChunks],
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true
        }
      })
    })
  }
}