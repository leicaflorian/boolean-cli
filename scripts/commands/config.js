const fs = require("fs")
const Conf = require("conf");

// Create a Configstore instance.
const config = new Conf({});

module.exports = function (program) {
  program
    .command("config")
    .description("Allow to specify global configs.")
    .option("-f, --video-folder <path>", "Path to the Google Drive video folder.")
    .option("-a, --all", "Read all existing config.")
    .option("-r, --reset", "Reset and remove all existing config.")
    .action((options) => {
      if (options.reset) {
        config.clear();
        return console.log("All settings has been removed");
      }

      if (options.all) {
        for (const conf of config) {
          console.log(conf);
        }

        return;
      }

      if (options.videoFolder) {
        if (!fs.existsSync(options.videoFolder)) {
          return console.error("La cartella specificata non esiste");
        }

        config.set("videoFolder", options.videoFolder);
      }
    });

  return config
}