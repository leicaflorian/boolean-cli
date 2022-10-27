const packageJson = require('../../package.json')
const chalk = require('chalk')
const { writeMainLogo } = require('../utilities/ui')

module.exports = function (program, conf) {
  const v = packageJson.version
  
  writeMainLogo()
  
  program
    .name('boolean-cli')
    .description(`CLI with some useful utilities for Boolean collaborators.\n\n` +
      `The CLI can be configured to read and write to a Google Drive folder.\n` +
      `To configure the path to this folder, just run
      ${chalk.yellow('boolean-cli config -f [folder_path]')}`)
    .version(v, '-v, --version')
}
