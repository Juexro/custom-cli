// https://github.com/michael-ciniawsky/postcss-load-config

module.exports = {
  'plugins': {
    // to edit target browsers: use "browserlist" field in package.json
    'autoprefixer': {
      'browsers': [
        'defaults',
        'ios >= 6',
        'not ie <= 100',
        'not ExplorerMobile <= 100',
        'not Opera <=100',
        'not OperaMini <= 100',
        'not OperaMini all',
        'not OperaMobile <= 100',
        'not BlackBerry <= 100'
      ]
    }
  }
}
