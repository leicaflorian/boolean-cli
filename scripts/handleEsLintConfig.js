const fs = require("fs");
const utilities = require("./utilities")

module.exports.updateEsLintConfig = function () {
  const fileName = ".eslintrc.js";
  
  utilities.logStartCheck(fileName);

  if (!fs.existsSync(fileName)) {
    utilities.warnNoFileFound(fileName);
    return;
  }

  const esLintFile = require(utilities.getPath(fileName));

  // Overwrite existing value
  esLintFile["ignorePatterns"] = ["dist/*"];
  
  utilities.logCompletedCheck(fileName);

  fs.writeFileSync(
    fileName,
    `module.exports = ${JSON.stringify(esLintFile, null, "  ")}`
  );
};
