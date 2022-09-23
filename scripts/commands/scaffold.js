const fs = require("fs-extra");
const path = require("path")
const { startCase } = require("lodash");
const { readTemplate, makeFolder, getPath, prepareFileName } = require("../utilities/fs");
const { info } = require("../utilities/logs");
const { Command } = require("commander");

/**
 * Create necessary files for html projects
 * 
 * @param {string} fileName
 * @param {boolean} withCss
 * @param {boolean} withJs
 */
function html(fileName, withCss = false, withJs = false) {
  info("[HTML]", "Starting...")

  const mustacheOptions = {
    title: startCase(path.basename(path.resolve("."))),
    css: withCss,
    js: withJs
  }

  const htmlFile = prepareFileName(fileName, "html", "index")
  const template = readTemplate("index.html", mustacheOptions)

  fs.writeFileSync(htmlFile, template)

  info(null, `Created '/${htmlFile}'`)
  info("[HTML]", "Completed!\n")
}

/**
 * Create necessary files for CSS
 * 
 * @param {string} fileName
 */
function css(fileName) {
  info("[CSS]", "Starting...")

  makeFolder("css")

  const cssFile = prepareFileName(fileName, "css", "style")
  const template = readTemplate("style.css")

  fs.writeFileSync(`css/${cssFile}`, template)

  info(null, `Created '/css/${cssFile}'`)
  info("[CSS]", "Completed!\n")
}

/**
 * Create necessary folder and files for
 */
function img() {
  info("[IMG]", "Starting...")

  fs.copySync(getPath(__dirname, "../templates/imgs"), "imgs")

  info(null, "Created folder '/imgs'")

  fs.readdirSync(getPath(__dirname, "../templates/imgs")).forEach(file => {
    info(null, `Created file '/imgs/${file}'`)
  })

  info("[IMG]", "Completed!\n")
}

/**
 * 
 * @param {Command} program 
 * @param {conf} conf 
 */
module.exports = function (program, conf) {
  program
    .command("scaffold")
    .description("Create basic scaffold for different projects.")
    .usage("[option] [value]")
    .option("-a, --all", "Basic HTML, CSS and Imgs")
    .option("-h, --html [fileName]", "Basic HTML (default: index.html)")
    .option("-c, --css [fileName]", "Basic CSS (default: style.css)")
    .option("-i, --img", "Basic Imgs")
    .action((options) => {
      console.log("\n");

      if (options.html) {
        html(typeof options.html === "string" ? options.html : null)
      }

      if (options.css) {
        css(typeof options.css === "string" ? options.css : null)
      }

      if (options.img) {
        img()
      }

      if (options.all) {
        html(null, true)
        css()
        img()
      }

    });
}