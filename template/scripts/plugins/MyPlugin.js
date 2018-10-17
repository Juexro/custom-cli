const HtmlWebpackPlugin = require('html-webpack-plugin')
const chalk = require('chalk')
class MyPlugin {
  constructor (options) {
    this.options = options
  }
  apply (compiler) {
    compiler.hooks.compilation.tap('MyPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapPromise(
        'MyPlugin',
        async (data) => {
          await new Promise(resolve => {
            if (this.options.appendHeader) {
              let title = data.html.match(/<(title)[^>]*>([\s\S]*?)<\/\1>\n/g)[0]
              title = title + this.options.appendHeader
              data.html = data.html.replace(/<(title)[^>]*>([\s\S]*?)<\/\1>\n/g, title)
            }
            resolve()
          })
        }
      )
    })
  }
}

module.exports = MyPlugin
