const fsExtra = require('fs-extra')
const fs = require('fs')
const path = require('path')
const { startCase } = require('lodash')
const { Command } = require('commander')
const { readTemplate, makeFolder, getPath, prepareFileName } = require('../utilities/fs')
const { info } = require('../utilities/logs')

/**
 * Create necessary files for html projects
 *
 * @param {{fileName: string, cssFileName?: string, jsFileName?: string, withCss?: boolean, withJs?: boolean}} settings
 */
function html (settings) {
  info('[HTML]', 'Starting...')
  
  const mustacheOptions = {
    title: startCase(path.basename(path.resolve('.'))) + (settings.fileName ? ` | ${startCase(settings.fileName)}` : ''),
    css: settings.withCss,
    cssFileName: prepareFileName(settings.cssFileName, 'css', 'style'),
    js: settings.withJs,
    jsFileName: prepareFileName(settings.jsFileName, 'js', 'script')
  }
  
  const htmlFile = prepareFileName(settings.fileName, 'html', 'index')
  const template = readTemplate('index.html', mustacheOptions)
  
  fs.writeFileSync(htmlFile, template)
  
  addFavIcon();
  
  info(null, `Created '/${htmlFile}'`)
  info('[HTML]', 'Completed!\n')
}

/**
 * Create necessary files for CSS
 *
 * @param {string} fileName
 */
function css (fileName) {
  info('[CSS]', 'Starting...')
  
  makeFolder('css')
  
  const cssFile = prepareFileName(fileName, 'css', 'style')
  const template = readTemplate('style.css')
  
  fs.writeFileSync(`css/${cssFile}`, template)
  
  info(null, `Created '/css/${cssFile}'`)
  info('[CSS]', 'Completed!\n')
}

/**
 * Create necessary folder and files for
 */
function img () {
  info('[IMG]', 'Starting...')
  
  fsExtra.copySync(getPath(__dirname, '../templates/imgs'), 'imgs', null)
  
  info(null, 'Created folder \'/imgs\'')
  
  fs.readdirSync(getPath(__dirname, '../templates/imgs')).forEach(file => {
    info(null, `Created file '/imgs/${file}'`)
  })
  
  info('[IMG]', 'Completed!\n')
}

function addFavIcon () {
  const favIconPath = path.resolve('imgs/favicon.ico')
  
  if (!fs.existsSync(favIconPath)) {
    fs.copyFileSync(getPath(__dirname, '../templates/favicon.ico'), favIconPath)
  }
}

/**
 * @param {Command} program
 */
module.exports = function (program) {
  program
    .command('scaffold')
    .description('Create basic scaffold for different projects.')
    .argument('[string]', 'file title', null)
    .usage('[file_name] [option] [value]')
    .option('-a, --all', 'Basic HTML, CSS and Imgs')
    .option('-h, --html [fileName]', 'Basic HTML (default: index.html)')
    .option('-c, --css [fileName]', 'Basic CSS (default: style.css)')
    .option('-i, --img', 'Basic Imgs')
    /**
     * @param {string} fileName
     * @param {{html, css, img, all}} options
     */
    .action((fileName, options) => {
      console.log('\n')
      
      if (options.html || options.all) {
        html({
            fileName: typeof options.html === 'string' ? options.html : fileName,
            cssFileName: typeof options.css === 'string' ? options.css : fileName,
            withCss: options.css || options.all
          }
        )
      }
      
      if (options.css || options.all) {
        css(typeof options.css === 'string' ? options.css : fileName)
      }
      
      if (options.img || options.all) {
        img()
      }
    })
}
