const fs = require("fs-extra");
const path = require("path")
const { startCase } = require("lodash");
const { readTemplate, makeFolder, getPath } = require("../utilities/fs");
const { info } = require("../utilities/logs");


function html(withCss = false, withJs = false) {
  info("\n[HTML]", "Starting...")

  const mustacheOptions = {
    title: startCase(path.basename(path.resolve(".")))
  }

  if (withCss) {
    mustacheOptions["css"] = true;
  }

  const template = readTemplate("index.html", mustacheOptions)

  fs.writeFileSync("index.html", template)

  info(null, "Created '/index.html'")

  info("[HTML]", "Completed!\n")
}

function css() {
  info("[CSS]", "Starting...")

  makeFolder("css")

  const template = readTemplate("style.css")

  fs.writeFileSync("css/style.css", template)

  info(null, "Created '/css/style.css'")

  info("[CSS]", "Completed!\n")
}

function img() {
  info("[IMG]", "Starting...")

  fs.copySync(getPath(__dirname, "../templates/imgs"), "imgs")

  info(null, "Created folder '/imgs'")

  fs.readdirSync(getPath(__dirname, "../templates/imgs")).forEach(file => {
    info(null, `Created file '/imgs/${file}'`)
  })

  info("[IMG]", "Completed!\n")
}

module.exports = function (program, conf) {
  program
    .command("scaffold")
    .description("Create the basic for different projects.")
    .option("-a, --all", "Basic HTML, CSS and Imgs")
    .option("-h, --html", "Basic HTML")
    .option("-c, --css", "Basic CSS")
    .option("-i, --img", "Basic Imgs")
    .action((options) => {

      if (options.html) {
        html()
      } else if (options.css) {
        css(options.css)
      } else if (options.img) {
        img()
      } else if (options.all) {
        html(true)
        css()
        img()
      }

    });
}