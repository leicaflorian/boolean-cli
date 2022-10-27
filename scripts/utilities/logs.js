const chalk = require('chalk')

function formatMessage (message, prefix) {
  return message.replace(/^\s{1,}/gm, ' '.repeat(prefix ? prefix.length + 3 : 0))
}

module.exports = {
  
  info (prefix, message) {
    let prefixString = prefix ? chalk.yellow(prefix) : ''
    
    console.info(prefixString, '-', formatMessage(message, prefix))
  },
  
  log (message) {
    console.info(formatMessage(message, ""))
  },
  
  warn (message) {
    const prefix = '[WARN]'
    let prefixString = prefix ? chalk.yellow(prefix) : '|'
    
    console.info(prefixString, '-', formatMessage(message, prefix))
  },
  
  error (message) {
    const prefix = '[ERR]'
    let prefixString = prefix ? chalk.red(prefix) : '|'
    
    console.info(prefixString, '-', formatMessage(message, prefix))
  },
  
  warnNoFileFound (fileName) {
    console.warn(`   ![WARN]! ${fileName} not found!`)
  }
}
