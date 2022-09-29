const chalk = require('chalk');

module.exports = {
  info(prefix, message) {
    let prefixString = prefix ? chalk.yellow(prefix) : "|"

    console.info(prefixString, "-", message)
  },

  warnNoFileFound(fileName) {
    console.warn(`   ![WARN]! ${fileName} not found!`);
  },
}