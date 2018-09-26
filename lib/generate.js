const Metalsmith = require('metalsmith')
const Handlebars = require('handlebars')
const rm = require('rimraf').sync
const chalk = require('chalk')
const _ = require('lodash')
const path = require('path')

module.exports = function (dest, answers) {
  const tmp = path.join(dest, 'template')

  return new Promise((resolve, reject) => {
    Metalsmith(tmp)
      .metadata(answers)
      .clean(false)
      .source('./')
      .destination(dest)
      .use((files, metalsmith, done) => {
        Object.keys(files).forEach(fileName => {
          if (!_.startsWith(fileName, 'src/font')) {
            const fileContentsString = files[fileName].contents.toString()
            files[fileName].contents = new Buffer(Handlebars.compile(fileContentsString)(metalsmith.metadata()))
          }
        })
        done()
      }).build(err => {
        rm(tmp)
        if (err) {
          console.log(chalk.red(`Metalsmith build error: ${err}`))
          return reject(err)
        } else {
          return resolve()
        }
      })
  })
}