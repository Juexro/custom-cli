const webpack = require('webpack')

const chalk = require('chalk')
const path = require('path')

const express = require('express')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const {
  VueLoaderPlugin
} = require('vue-loader')
const useExpressProxy = require('./plugins/useExpressProxy')

const MyPlugin = require('./plugins/MyPlugin.js')

const proxyTable = require('./configs/proxy')
const appEnvs = require('./configs/envs')

const cssLoaders = require('./utils/cssLoaders')

function resolve(name) {
  return path.resolve(__dirname, '..', name)
}

const app = express()

console.log(chalk.yellow('The development server is starting......wait me.'))

const compiler = webpack({
  entry: {
    main: ['webpack-hot-middleware/client?reload=true&noInfo=true', './src/main.js']
  },
  output: {
    publicPath: '/',
    path: resolve('dist'),
    filename: 'static/js/[name].[hash].js',
    chunkFilename: 'static/js/[name].[chunkhash].js'
  },
  resolve: {
    modules: [resolve('node_modules'), resolve('src')],
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
      ...cssLoaders({
        mode: 'development'
      }),
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test')]
      },
      {
        test: /vue-human(-\w+)?[\/\\].*\.js$/,
        loader: 'babel-loader',
        exclude: /vue-human(-\w+)?[\/\\]node_modules[\/\\].*/
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
  mode: 'development',
  devtool: '#cheap-module-eval-source-map',
  plugins: [
    new FriendlyErrorsWebpackPlugin(),
    new webpack.EnvironmentPlugin(appEnvs),
    new webpack.HotModuleReplacementPlugin(),
    new MyPlugin({
      appendHeader: `<script>console.log('This is my plugin.')</script>`
    }),
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: resolve('index.html'),
      filename: 'index.html',
      chunks: ['main'],
      title: 'main'
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

useExpressProxy(app, proxyTable)

devMiddleware.waitUntilValid(() => {
  console.log(chalk.yellow(`I am ready. open http://localhost:9000/#/ to see me.`))
})

app.listen(9000)