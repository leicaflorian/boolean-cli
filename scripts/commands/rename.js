
const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const { up } = require("inquirer/lib/utils/readline");
const { getPath } = require("../utilities/fs");
const chalk = require("chalk");
const logs = require("../utilities/logs");

const rootFolder = getPath()
let config;

/**
 * 
 * @returns {string|null}
 */
function getLastRemoteFile() {
  let toReturn = null;

  if (config.get('videoFolder')) {
    const files = fs.readdirSync(config.get('videoFolder'))
    const videoFiles = files.filter(file => file.endsWith('.mp4'))

    if (videoFiles.length > 0) {
      toReturn = videoFiles[videoFiles.length - 1]
    }
  }

  return toReturn
}

function getVideoNumber() {
  let toReturn = 0

  const lastFile = getLastRemoteFile()

  if (lastFile) {
    const fileData = parseVideoFileName(lastFile);

    toReturn = fileData.videoNum + 1

    if (fileData.videoPart === 1) {
      toReturn = fileData.videoNum
    }
  }

  return toReturn ? +toReturn : 1
}

function getVideoPart(videoFiles) {
  let toReturn = videoFiles.length <= 1 ? null : 1

  // if multipart options is false, avoid calculating the part
  if (!config.get("multipart")) {
    return toReturn
  }

  const lastFile = getLastRemoteFile()

  if (lastFile) {
    const fileData = parseVideoFileName(lastFile);

    toReturn = fileData.videoPart === 1 ? 2 : 1
  }

  return toReturn
}

function rename(upload = false) {
  const videoFiles = fs.readdirSync(rootFolder).reduce((acc, file) => {
    const ext = path.extname(file)

    if (ext === '.mp4') {
      acc.push(file)
    }

    return acc
  }, [])

  if (upload && !config.get("videoFolder")) {
    return console.warn(
      chalk.red(`Cartella Google Drive non configurata.\nPer configurarla usa il comando: 
      ${chalk.yellow("boolean-cli config -f [folder_path]")}`)
    );
  }

  if (videoFiles.length === 0) {
    return console.warn("Nessun file da rinominare trovato.");
  }

  logs.info("[Rename]", "File trovati: " + videoFiles.join(",") + "\n");

  const lastFile = getLastRemoteFile()

  inquirer
    .prompt([
      {
        name: 'video_number',
        message: `Indica il ${chalk.bold.green("numero")} del ${chalk.bold.green("video")} ------------------:`,
        type: 'number',
        default: getVideoNumber(),
        /* transformer: (input) => {
          if (!input || Number.isNaN(+input)) {
            return input
          }

          return input.toString().padStart(2, '0')
        }, */
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
        message: `Indica la ${chalk.bold.green("parte")} del ${chalk.bold.green("video")}.\n  ${chalk.italic("(Scrivere 0 in caso di parte unica)")} ---------:`,
        type: "number",
        default: getVideoPart(videoFiles),
        transformer: (input) => {
          return Number.isNaN(input) ? "" : input;
        }
      },
      {
        name: "lesson_code",
        message: `Indica il ${chalk.bold.green("numero")} della ${chalk.bold.green('lezione')}\n  ${chalk.italic("(Lasciare vuoto in caso non serva)")} ----------:`,
        type: "number",
        transformer: (input) => {
          return Number.isNaN(input) ? "" : input;
        }
      },
      {
        name: "lesson_name",
        message: `Indica il ${chalk.bold.green("titolo")} da assegnare alla ${chalk.bold.green("lezione")} --:`,
        type: "input",
        validate: (input) => {
          if (!input || !input.trim()) {
            // Pass the return value in the done callback
            return "E' necessario assegnare un titolo alla lezione";
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

      logs.info(null, `Restored file: ${chalk.grey(file.new)} => ${chalk.green(file.old)}`)
    }
  });

  fs.rmSync(jsonFilePath);
}

function onInputsReceived(answers, videoFiles, upload) {
  const toRename = [];

  for (let index = 0; index < videoFiles.length; index++) {
    const file = videoFiles[index];
    const newName = createVideoFileName(answers, index)

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
        chalk.yellow("Confermi di voler rinominare i seguenti file?") +
        `\n - ${toRename
          .map((file) => `${chalk.bold.grey(file.old)} => ${chalk.bold.green(file.new)}`)
          .join("\n   - ")
        } `,
    },
  ];

  console.log("\n");

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
            console.log(` - File uploaded to ${filePath} `)
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

/**
 * 
 * @param {string} file 
 * @return {{videoNum: number, videoPart: number, lessonNum: number, date: string, fileName: string}}
 */
function parseVideoFileName(file) {
  // 4 blocks = video_num - date - lesson_num - file_name
  // 3 blocks = video_num - date - file_name
  const blocks = file.split("-")

  const videoNum = {
    num: blocks[0].split("_")[0],
    part: blocks[0].split("_")[1] ?? null,
  }

  const date = blocks[1];
  const lessonNum = blocks.length === 4 ? blocks[2] : null;
  const fileName = blocks.length === 4 ? blocks[3] : blocks[2];

  return {
    videoNum: +videoNum.num,
    videoPart: videoNum.part ? +videoNum.part : null,
    lessonNum: lessonNum ? +lessonNum : null,
    date,
    fileName
  }
}

function createVideoFileName(answers, index) {
  const { video_number, video_part_number, lesson_code, lesson_name } = answers;
  const date = new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
  })
    .format(new Date())
    .replace(" ", "")
    .toUpperCase();

  const newName = [];
  let videoNum = [video_number.toString().padStart(2, "0")];

  if (video_part_number) {
    videoNum.push(video_part_number + index)
  }

  newName.push(videoNum.join("_"))
  newName.push(date)

  if (lesson_code) {
    newName.push(lesson_code)
  }

  newName.push(lesson_name.toLowerCase().replace(/ /g, "_"))

  return newName.join("-") + ".mp4";
}

module.exports = function (program, _conf) {
  config = _conf

  program
    .command("rename")
    .description("Rename Zoom files using the Boolean pattern and eventually copy them to a specific folder like a Google Drive one.\n\n" +
      "To be able to copy the file to a folder, first that folder must be configured. To do so, just run\n" +
      chalk.yellow("boolean-cli config -f [folder_path]"))
    .option("-r, --revert", "Revert the rename operation.")
    .option("-u, --upload", "Upload renamed files to Google Drive folder, if this is configured.")
    .action((options) => {
      if (options.revert) {
        revert()
      } else {
        rename(options.upload)
      }
    });
}
/* 
console.log(parseVideoFileName("08_2-23SET-119-css_flex.mp4"));
console.log(parseVideoFileName("08-23SET-119-css_flex.mp4"));
console.log(parseVideoFileName("08-23SET-css_flex.mp4")); */