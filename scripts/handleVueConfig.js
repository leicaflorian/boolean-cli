const fs = require("fs");
const utilities = require("./utilities");


module.exports.updateVueConfig = function () {
  const fileName = "vue.config.js";
  let vueConfigFile = {};
  
  utilities.logStartCheck(fileName);
  
  if (fs.existsSync(fileName)) {
    vueConfigFile = require(utilities.getPath(fileName));
  }
  
  // Overwrites current publicPath
  vueConfigFile["publicPath"] = "./";
  
  utilities.logCompletedCheck(fileName);
  
  fs.writeFileSync(
    fileName,
    `module.exports = ${JSON.stringify(vueConfigFile, null, "  ")}`
  );
};
