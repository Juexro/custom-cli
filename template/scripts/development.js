const webpack = require('webpack')

const chalk = require('chalk')
const path = require('path')

const express = require('express')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const OpenBrowserPlugin = require('@juexro/open-browser-webpack-plugin')
const {
  VueLoaderPlugin
} = require('vue-loader')

const useExpressProxy = require('./utils/useExpressProxy')
const cssLoaders = require('./utils/cssLoaders')
const addHotUpdate = require('./utils/addHotUpdate')

const MyPlugin = require('./plugins/MyPlugin')
const htmlWebpackPlugins = require('./plugins/htmlWebpackPlugins')

let configs = require('./config')
configs.mode = 'development'

function resolve(name) {
  return path.resolve(__dirname, '..', name)
}

const app = express()
const { port = 9000, openBrowser} = configs
const openUrl = `http://localhost:${port}/${openBrowser.pageName}`

console.log(chalk.yellow('The development server is starting......wait me.'))

const compiler = webpack({
  entry: addHotUpdate(configs),
  output: {
    publicPath: '/',
    path: resolve('dist'),
    filename: 'static/js/[name].[hash].js',
    chunkFilename: 'static/js/[name].[chunkhash].js'
  },
  resolve: {
    modules: [resolve('node_modules'), resolve('pages'), resolve('src')],
    extensions: ['.js', '.vue', '.json']
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [{
          loader: 'vue-loader'
        }]
      },
      ...cssLoaders(configs),
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test'), resolve('pages')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'static/img/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'static/media/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'static/fonts/[name].[hash:7].[ext]'
        }
      }
    ]
  },
  mode: configs.mode,
  devtool: '#cheap-module-eval-source-map',
  plugins: [
    new FriendlyErrorsWebpackPlugin(),
    new webpack.EnvironmentPlugin(configs.envs),
    new webpack.HotModuleReplacementPlugin(),
    new MyPlugin({
      appendHeader: `<script>console.log('This is my plugin.')</script>`
    }),
    new VueLoaderPlugin(),
    ...htmlWebpackPlugins(configs),
    openBrowser.autoOpen && new OpenBrowserPlugin({
      url: openUrl
    })
  ],
  optimization: {
    noEmitOnErrors: true
  },
  node: {
    setImmediate: false,
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
})

const devMiddleware = webpackDevMiddleware(compiler, {
  publicPath: '/',
  logLevel: 'silent'
})

const hotMiddleware = webpackHotMiddleware(compiler, {
  log: false
})

compiler.hooks.compilation.tap('html-webpack-plugin-after-emit', () => {
  hotMiddleware.publish({
    action: 'reload'
  })
})

app.use(devMiddleware)
app.use(hotMiddleware)

configs.proxyTable && useExpressProxy(app, configs.proxyTable)

devMiddleware.waitUntilValid(() => {
  console.log(chalk.yellow(`I am ready. open ${openUrl} to see me.`))
})

app.listen(port)