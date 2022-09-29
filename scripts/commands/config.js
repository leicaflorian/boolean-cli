const fs = require("fs")
const Conf = require("conf");
const logs = require("../utilities/logs");
const chalk = require("chalk");

// Create a Configstore instance.
const config = new Conf({});

module.exports = function (program) {
  program
    .command("config")
    .description("Allow to specify global configurations.")
    .option("-f, --video-folder <path>", "Path to the Google Drive video folder.")
    .option("-m, --multipart <bool>", "Boolean that indicate if by default, video files will have more than one part. This will be used to suggest the right part name.")
    .option("-a, --all", "Read all existing config.")
    .option("-r, --reset", "Reset and remove all existing config.")
    .action((options) => {
      if (options.reset) {
        config.clear();
        return console.log("All settings has been reset");
      }

      if (options.all) {
        for (const conf of config) {
          logs.info(`[${chalk.bold(conf[0])}]`, chalk.green(conf[1]));
        }

        return;
      }

      if (options.videoFolder) {
        if (!fs.existsSync(options.videoFolder)) {
          return console.error("La cartella specificata non esiste");
        }

        config.set("videoFolder", options.videoFolder);

        logs.info("[Config]", "Destination folder set as " + chalk.green(config.get("videoFolder")))
      }

      if (options.multipart) {
        config.set("multipart", options.multipart.toLowerCase().trim() === "true");

        logs.info("[Config]", "Multipart option set as " + chalk.green(config.get("multipart")))
      }
    });

  return config
}