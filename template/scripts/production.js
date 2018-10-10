const webpack = require('webpack')

const path = require('path')
const chalk = require('chalk')
const ora = require('ora')

const cleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const htmlWebpackPlugins = require('./plugins/htmlWebpackPlugins')

let configs = require('./config')
configs.mode = 'production'

const {analyzer} = configs

const cssLoaders = require('./utils/cssLoaders')
const addHotUpdate = require('./utils/addHotUpdate')

function resolve(name) {
  return path.resolve(__dirname, '..', name)
}

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
    extensions: ['.js', '.jsx', '.json']
  },
  module: {
    rules: [
      ...cssLoaders(configs),
      {
        test: /\.(js|jsx)$/,
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
  performance: {
    hints: false
  },
  plugins: [
    new cleanWebpackPlugin(['dist'], {
      root: path.resolve(__dirname, '..')
    }),
    new webpack.HashedModuleIdsPlugin(),
    new webpack.EnvironmentPlugin(configs.envs),
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash].css'
    }),
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true,
        discardComments: {
          removeAll: true
        }
      }
    }),
    ...htmlWebpackPlugins({
      ...configs,
      suffixChunks: ['vendors', 'mainifest', 'common']
    }),
    analyzer && new BundleAnalyzerPlugin()
  ],
  optimization: {
    runtimeChunk: {
      name: 'mainifest'
    },
    splitChunks: {
      chunks: 'async',
      minSize: 30000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        vendor: {
          test: /node_modules\/(.*)\.js/,
          name: 'vendors',
          chunks: 'initial',
          priority: -10,
          reuseExistingChunk: false
        },
        common: {
          test: 'common',
          chunks: 'initial',
          name: 'common'
        }
      }
    },
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        uglifyOptions: {
          warning: false,
          compress: {
            drop_console: true
          }
        },
        sourceMap: true
      })
    ]
  }
})

const spinner = ora('building for production...')
spinner.start()
compiler.run((err, stats) => {
  spinner.stop()
  if (err) throw err
  process.stdout.write(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }) + '\n\n')

  console.log(chalk.cyan('  Build complete.\n'))
  console.log(chalk.yellow(
    '  Tip: built files are meant to be served over an HTTP server.\n' +
    '  Opening index.html over file:// won\'t work.\n'
  ))
})
