const path = require("path");

module.exports = {
  logStartCheck (fileName) {
    console.log(`➡ Checking ${fileName} file...`);
  },
  
  logCompletedCheck (fileName) {
    console.log(`  Updating ${fileName} file...`);
  },
  
  warnNoFileFound (fileName) {
    console.warn(`   ![WARN]! ${fileName} not found!`);
  },
  getPath (...pathSections) {
    return path.resolve(...pathSections);
  }
};
