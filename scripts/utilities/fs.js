const path = require("path")
const fs = require("fs")
const Mustache = require('mustache');


/**
 * Reaad a template and render it with mustache syntax and data
 * 
 * @param {string} file 
 * @param {{}} data 
 * 
 * @return {string}
 */
function readTemplate(file, data = {}) {
  const templatePath = path.resolve(__dirname, "../templates/" + file);
  let tmpl = fs.readFileSync(templatePath, "utf-8")

  if (data) {
    tmpl = Mustache.render(tmpl, data)
  }

  return tmpl
}

/**
 * Create a folder if this does not exist
 * 
 * @param {string} folder 
 */
function makeFolder(folder) {
  if (!folder) {
    return;
  }

  const cssFolderPath = path.resolve(folder)

  if (!fs.existsSync(cssFolderPath)) {
    fs.mkdirSync(cssFolderPath)
  }
}

/**
 * 
 * @param {string} name 
 * @param {string} extension 
 */
function prepareFileName(name, extension, defaultName = null) {
  let fileName = name ?? defaultName ?? "";

  if (!fileName.endsWith("." + extension)) {
    fileName += "." + extension
  }

  return fileName
}

module.exports = {
  readTemplate,
  makeFolder,
  prepareFileName,
  getPath(...pathSections) {
    return path.resolve(...pathSections);
  }
} 