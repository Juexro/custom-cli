const process = require('process')
const path = require('path')
module.exports = function (options) {
  const {mode, entry} = options
  let copyEntries = {}
  for (let [k, v] of Object.entries(entry)) {
    if (mode === 'development') {
      copyEntries[k] = ['webpack-hot-middleware/client?reload=true&noInfo=true'].concat(v.map((way) => {
        return path.resolve(process.cwd(), way)
      }))
    } else {
      copyEntries[k] = v.map((way) => {
        return path.resolve(process.cwd(), way)
      })
    }
  }
  return copyEntries
}