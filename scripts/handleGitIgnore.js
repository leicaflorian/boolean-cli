const fs = require("fs");
const utilities = require("./utilities")

module.exports.updateGitIgnore = function () {
  const fileName = ".gitignore";
  
  utilities.logStartCheck(fileName);

  if (!fs.existsSync(fileName)) {
    utilities.warnNoFileFound(fileName);
    return;
  }

  const gitignoreFile = fs.readFileSync(fileName).toString();
  const distRegex = new RegExp("^[\\\\/]dist$", "m");

  if (gitignoreFile.match(distRegex)) {
    const result = gitignoreFile.replace(distRegex, "");
  
    utilities.logCompletedCheck(fileName);

    fs.writeFileSync(fileName, result);
  }
};
