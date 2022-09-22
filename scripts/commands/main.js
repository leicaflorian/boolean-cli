const packageJson = require("../../package.json");

module.exports = function (program, conf) {
  const v = packageJson.version;

  program
    .name("boolean-cli")
    .description("CLI to some utilities useful for Boolean")
    .version(v, "-v, --version");
}