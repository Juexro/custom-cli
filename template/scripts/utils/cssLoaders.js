const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = function (options) {
  options = options || {}

  var cssLoader = {
    loader: 'css-loader',
    options: {
      minimize: !!(options.mode === 'production'),
      sourceMap: options.sourceMap
    }
  }
  var postcssLoader = {
    loader: 'postcss-loader'
  }

  function generateLoaders (loader) {
    var loaders = [cssLoader, postcssLoader]

    if (loader) {
      if (
        typeof loader === 'string' ||
        (typeof loader === 'object' && loader.constructor === Object)
      ) {
        loader = [loader]
      }

      loader.forEach(item => {
        loaders.push(handleLoader(item))
      })
    }

    if (options.extract) {
      return [MiniCssExtractPlugin.loader].concat(loaders)
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
  }

  function handleLoader (loader) {
    if (typeof loader === 'string') {
      return {
        loader: loader + '-loader',
        options: {
          sourceMap: options.sourceMap
        }
      }
    } else if (typeof loader === 'object' && loader.constructor === Object) {
      return loader
    }
  }

  function getScssConfig () {
    if (!options.sassResources) return [ 'sass' ]

    return [
      'sass',
      {
        loader: 'sass-resources-loader',
        options: {
          resources: options.sassResources
        }
      }
    ]
  }

  return [
    {
      test: /\.css$/,
      use: generateLoaders()
    },
    {
      test: /\.scss$/,
      use: generateLoaders(getScssConfig())
    },
    {
      test: /\.less$/,
      use: generateLoaders(['less'])
    }
  ]
}
