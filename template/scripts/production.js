const webpack = require('webpack')

const path = require('path')
const merge = require('webpack-merge')
const chalk = require('chalk')
const ora = require('ora')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const cleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const analyzer = require('webpack-bundle-analyzer')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')

const {
  VueLoaderPlugin
} = require('vue-loader')

const appEnvs = require('./configs/envs')

const cssLoaders = require('./utils/cssLoaders')

function resolve(name) {
  return path.resolve(__dirname, '..', name)
}

const compiler = webpack({
  entry: {
    main: './src/main.js'
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
        mode: 'production'
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
  mode: 'production',
  performance: {
    hints: false
  },
  plugins: [
    new cleanWebpackPlugin(['dist'], {
      root: path.resolve(__dirname, '..')
    }),
    new webpack.HashedModuleIdsPlugin(),
    new webpack.EnvironmentPlugin(appEnvs),
    new VueLoaderPlugin(),
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
    new HtmlWebpackPlugin({
      template: resolve('index.html'),
      filename: 'index.html',
      chunks: ['main', 'vendors', 'mainifest', 'common'],
      title: 'main',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      }
    }),
    // new webpack.SourceMapDevToolPlugin({
    //   test: /\.js$/,
    //   filename: 'sourcemap/[name].[chunkhash].map',
    //   append: false
    // })
    new analyzer.BundleAnalyzerPlugin()
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
