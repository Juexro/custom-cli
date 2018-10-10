module.exports = {
  envs: {
    VERSION: require('../../package.json').version
  },
  entry: {
    pageA: ['pages/pageA/main.js'],
    pageB: ['pages/pageB/main.js']
  },
  pages: [{
    template: 'pages/pageA/index.html',
    filename: 'pageA/index.html',
    chunks: ['pageA'],
    title: 'pageA'
  }, {
    template: 'pages/pageB/index.html',
    filename: 'pageB/index.html',
    chunks: ['pageB'],
    title: 'pageB'
  }],
  openBrowser: {
    pageName: 'pageA',
    autoOpen: true
  },
  proxyTable: {},
  port: 9001,
  analyzer: true
}