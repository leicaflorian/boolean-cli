const fs = require("fs");
const utilities = require("./utilities");

module.exports.updatePackageJson = function () {
  const fileName = "package.json";

  utilities.logStartCheck(fileName);

  if (!fs.existsSync(fileName)) {
    utilities.warnNoFileFound(fileName);
    return;
  }

  const packageJsonFile = require(utilities.getPath(fileName));

  packageJsonFile.scripts["build_push"] =
    'npm run build && git add --renormalize . && git commit -n -m "Created/Updated build" && git push';

  // Eslint config can be configured inside the package.json
  if (packageJsonFile["eslintConfig"]) {
    packageJsonFile.eslintConfig["ignorePatterns"] = ["dist/*"];
  }

  utilities.logCompletedCheck(fileName);

  fs.writeFileSync(fileName, JSON.stringify(packageJsonFile, null, "  "));
};
