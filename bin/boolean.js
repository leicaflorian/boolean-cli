#! /usr/bin/env node

const { program } = require("commander");
const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const utilities = require("../scripts/utilities");
const packageJson = require("../package.json");
const Conf = require("conf");
const { up } = require("inquirer/lib/utils/readline");

const v = packageJson.version;

// Create a Configstore instance.
const config = new Conf({});

program
  .name("boolean-cli")
  .description("CLI to some utilities useful for Boolean")
  .version(v, "-v, --version");

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

program
  .command("rename")
  .description("Rename Zoom files using the Boolean pattern.")
  .option("-r, --revert", "Revert the rename operation.")
  .option(
    "-u, --upload",
    'Upload renamed files to Google Drive folder if this is configured.'
  )
  .action((options) => {
    if (options.revert) {
      revert()
    } else {
      rename(options.upload)
    }
  });

const rootFolder = utilities.getPath()

function getVideoNumber () {
  let toReturn = 0
  
  if (config.get('videoFolder')) {
    const files = fs.readdirSync(config.get('videoFolder'))
    const videoFiles = files.filter(file => file.endsWith('.mp4'))
    
    const lastFile = videoFiles[videoFiles.length - 1]
    
    toReturn = lastFile.match(/^\d+/)[0]
  }
  
  return toReturn ? +toReturn + 1 : 0
}

function rename (upload = false) {
  const videoFiles = fs.readdirSync(rootFolder).reduce((acc, file) => {
    const ext = path.extname(file)
    
    if (ext === '.mp4') {
      acc.push(file)
    }
    
    return acc
  }, [])

  if (upload && !config.get("videoFolder")) {
    return console.warn(
      "Cartella Google Drive non configurata.\nPer configurarla usa il comando 'boolean-cli config -f <path>'"
    );
  }

  if (videoFiles.length === 0) {
    return console.warn("Nessun file da rinominare trovato.");
  }

  console.log("file da analizzare:", videoFiles);

  inquirer
    .prompt([
      {
        name: 'video_number',
        message: 'Indica il numero del video',
        type: 'number',
        default: getVideoNumber(),
        transformer: (input) => {
          if (!input || Number.isNaN(+input)) {
            return input
          }
      
          return input.toString().padStart(2, '0')
        },
        validate: (input) => {
          if (!input || Number.isNaN(+input)) {
            // Pass the return value in the done callback
            return 'You need to provide a video number'
          } else {
            return true
          }
        },
      },
      {
        name: "video_part_number",
        message: "Indica la parte del video",
        type: "number",
        default: videoFiles.length <= 1 ? 0 : 1,
        transformer: (input) => {
          return Number.isNaN(input) ? "" : input;
        },
      },
      {
        name: "lesson_code",
        message: "Indica il numero della lezione",
        type: "number",
        transformer: (input) => {
          return Number.isNaN(input) ? "" : input;
        },
      },
      {
        name: "lesson_name",
        message: "Indica il nome da assegnare alla lezione",
        type: "input",
        validate: (input) => {
          if (!input || !input.trim()) {
            // Pass the return value in the done callback
            return "You need to provide a lesson_name";
          } else {
            return true;
          }
        },
      },
    ])
    .then((answers) => onInputsReceived(answers, videoFiles, upload))
    .catch((error) => {
      console.log(error);
      if (error.isTtyError) {
        // Prompt couldn't be rendered in the current environment
      } else {
        // Something else went wrong
      }
    });
}

function revert() {
  const jsonFilePath = path.join(rootFolder, ".rename.json");

  if (!fs.existsSync(jsonFilePath)) {
    console.log("Non ci sono file da ripristinare");
    return;
  }

  const jsonFile = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));

  jsonFile.files.forEach((file) => {
    const oldPath = path.join(rootFolder, file.old);
    const newPath = path.join(rootFolder, file.new);

    if (fs.existsSync(newPath)) {
      fs.renameSync(newPath, oldPath);
    }
  });

  fs.rmSync(jsonFilePath);
}

function onInputsReceived(answers, videoFiles, upload) {
  const { video_number, video_part_number, lesson_code, lesson_name } = answers;
  const date = new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
  })
    .format(new Date())
    .replace(" ", "")
    .toUpperCase();

  const toRename = [];

  for (let index = 0; index < videoFiles.length; index++) {
    const file = videoFiles[index];
    const newName = `${video_number.toString().padStart(2, "0")}${
      video_part_number ? "_" + (video_part_number + index) : ""
    }-${date}-${lesson_code ? lesson_code + "-" : ""}${lesson_name
      .toLowerCase()
      .replace(/ /g, "_")}.mp4`;

    toRename.push({
      old: file,
      new: newName,
    });
  }

  const questions = [
    {
      name: "confirm",
      type: "confirm",
      message:
        "Confermi di voler rinominare i seguenti file?" +
        `\n   - ${toRename
          .map((file) => `${file.old} => ${file.new}`)
          .join("\n   - ")}`,
    },
  ];

  inquirer
    .prompt(questions)
    .then((answers) => {
      if (answers.confirm) {
        createInternalRenameDetails(toRename);

        toRename.forEach((file) => {
          const oldPath = path.join(rootFolder, file.old);
          const newPath = path.join(rootFolder, file.new);
          fs.renameSync(oldPath, newPath);

          if (config.get("videoFolder") && upload) {
            console.log(` - Uploading file ${file.new} to Google Drive`)
            const filePath = path.join(config.get('videoFolder'), file.new)
  
            fs.copyFileSync(
              newPath,
              filePath
            )
            console.log(` - File uploaded to ${filePath}`)
          }
        });
      } else {
        console.log("Operazione annullata");
      }
    })
    .catch((error) => {
      console.log(error);
      if (error.isTtyError) {
        // Prompt couldn't be rendered in the current environment
      } else {
        // Something else went wrong
      }
    });
}

function createInternalRenameDetails(filesToRename) {
  fs.writeFileSync(
    path.join(rootFolder, ".rename.json"),
    JSON.stringify({
      date: new Date(),
      files: filesToRename,
    })
  );
}

program.parse();
