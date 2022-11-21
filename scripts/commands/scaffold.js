/**
 * @typedef {import('./scaffold').WizardResult} WizardResult
 * @typedef {import('./scaffold').ScaffoldOptions} ScaffoldOptions
 */

const fsExtra = require('fs-extra')
const fs = require('fs')
const path = require('path')
const { startCase } = require('lodash')
const { Command } = require('commander')
const inquirer = require('inquirer')
const { readTemplate, makeFolder, getPath, prepareFileName } = require('../utilities/fs')
const { info, log } = require('../utilities/logs')
// const chalk = require('chalk')
const { writeSection } = require('../utilities/ui')
const shell = require('shelljs')

/**
 * Create necessary files for html projects
 *
 * @param {{fileName: string, cssFileName?: string, jsFileName?: string, withCss?: boolean, withJs?: boolean}} settings
 */
async function html (settings) {
  info('[HTML]', 'Starting...')
  
  const mustacheOptions = {
    title: startCase(path.basename(path.resolve('.'))) + (settings.fileName ? ` | ${startCase(settings.fileName)}` : ''),
    css: settings.withCss,
    cssFileName: prepareFileName(settings.cssFileName, 'css', 'style'),
    js: settings.withJs,
    jsFileName: prepareFileName(settings.jsFileName, 'js', 'main')
  }
  
  // get the list of third party libraries to add
  const extraLibraries = await askForLibraries()
  
  if (extraLibraries.length > 0) {
    mustacheOptions.libraries = extraLibraries
  }
  
  const htmlFile = prepareFileName(settings.fileName, 'html', 'index')
  const template = readTemplate('index.html', mustacheOptions)
  
  fs.writeFileSync(htmlFile, template)
  
  addFavIcon()
  
  info('      ', `Created '/${htmlFile}'`)
  info('      ', 'Completed!\n')
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
  
  info('     ', `Created '/css/${cssFile}'`)
  info('     ', 'Completed!\n')
}

/**
 * Create necessary files for JS
 *
 * @param {string} fileName
 */
function js (fileName) {
  info('[JS]', 'Starting...')
  
  makeFolder('js')
  
  const jsFile = prepareFileName(fileName, 'js', 'main')
  const template = readTemplate('main.js')
  
  fs.writeFileSync(`js/${jsFile}`, template)
  
  info('    ', `Created '/js/${jsFile}'`)
  info('    ', 'Completed!\n')
}

/**
 * Create necessary folder and files for
 */
function img () {
  info('[IMG]', 'Starting...')
  
  fsExtra.copySync(getPath(__dirname, '../templates/imgs'), 'imgs', null)
  
  info('     ', 'Created folder \'/imgs\'')
  
  fs.readdirSync(getPath(__dirname, '../templates/imgs')).forEach(file => {
    info('     ', `Created file '/imgs/${file}'`)
  })
  
  info('     ', 'Completed!\n')
}

function addFavIcon () {
  const favIconPath = path.resolve('imgs/favicon.ico')
  
  if (!fs.existsSync('imgs')) {
    fs.mkdirSync('imgs')
  }
  
  if (!fs.existsSync(favIconPath)) {
    fs.copyFileSync(getPath(__dirname, '../templates/favicon.ico'), favIconPath)
  }
}

function readme (fileName) {
  info('[README]', 'Starting...')
  
  const readmeFile = 'README.md'
  const template = readTemplate('README.md', {
    title: startCase(path.basename(path.resolve('.')))
  })
  
  fs.writeFileSync(`./${readmeFile}`, template)
  
  info('    ', `Created '${readmeFile}'`)
  info('    ', 'Completed!\n')
}

/**
 * Show a wizard for scaffolding a new project
 *
 * @return {Promise<WizardResult>}
 */
async function showWizard () {
  log(`Welcome to the HTML Scaffold Wizard!
    This wizard will help you to create the basic HTML scaffold for your project.\n`)
  
  return await inquirer.prompt([
    {
      name: 'project_name',
      message: `Indica il nome del progetto:`,
      type: 'string',
      default: path.basename(path.resolve('.'))
    }, {
      name: 'files_to_create',
      message: `Scegli il tipo di file che vuoi creare:`,
      type: 'checkbox',
      choices: [{
        name: 'HTML',
        value: 'html'
      }, {
        name: 'Images',
        value: 'img'
      }, {
        name: 'CSS',
        value: 'css'
      }, {
        name: 'JS',
        value: 'js'
      }]
    }, {
      name: 'html_file_name',
      message: `Indica il nome del file HTML:`,
      type: 'string',
      default: 'index',
      when: answers => answers.files_to_create.includes('html')
    }, {
      name: 'css_file_name',
      message: `Indica il nome del file CSS:`,
      type: 'string',
      default: 'style',
      when: answers => answers.files_to_create.includes('css')
    }, {
      name: 'js_file_name',
      message: `Indica il nome del file JS:`,
      type: 'string',
      default: 'main',
      when: answers => answers.files_to_create.includes('js')
    }
  ])
}

/**
 * Ask to initialize git repository
 */
function askForInitialCommit () {
  // if git command not available OR git already initialized, skip
  if (!shell.which('git') || shell.exec('git log --reverse', { silent: true }).code === 0) {
    return
  }
  
  inquirer.prompt([
    {
      name: 'make_commit',
      message: `Si desidera creare un commit iniziale con i file appena creati?`,
      type: 'confirm',
      default: true
    }
  ]).then(answers => {
    if (answers.make_commit) {
      shell.exec('git add .')
      shell.exec('git commit -m "Initial scaffolding"')
      
      log(`Commit creato.\n`)
      
      shell.exec('git push')
      
      log(`Dati inviati al repository remoto.\n`)
    }
  })
}

async function askForLibraries () {
  const toReturn = []
  
  const answers = await inquirer.prompt([
    {
      name: 'libraries',
      message: `Si desidera aggiungere qualche libreria di terze parti? Lasciare deselezionato per saltare.`,
      type: 'checkbox',
      choices: [{
        name: 'Bootstrap 5',
        value: 'bs5'
      }, {
        name: 'Font Awesome 5',
        value: 'fa6'
      }, {
        name: 'Vue 3',
        value: 'vue'
      }]
    }
  ])
  
  if (answers.libraries.includes('bs5')) {
    toReturn.push({
      isLink: true,
      src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css'
    })
  }
  
  if (answers.libraries.includes('fa6')) {
    toReturn.push({
      isLink: true,
      src: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css'
    })
  }
  
  if (answers.libraries.includes('vue')) {
    toReturn.push({
      isScript: true,
      src: 'https://unpkg.com/vue@3/dist/vue.global.js'
    })
  }
  
  return toReturn
}

/**
 * @param {string} fileName
 * @param {ScaffoldOptions} options
 * @return {Promise<void>}
 */
async function execute (fileName, options) {
  writeSection('SCAFFOLD')
  
  // console.log(fileName, options)
  
  // auto show the wizard if no options are provided
  if (Object.keys(options).length === 0) {
    const wizardResult = await showWizard()
    
    wizardResult.files_to_create.forEach(file => {
      options[file] = wizardResult[`${file}_file_name`] || true
    })
  }
  
  if (options.html || options.all) {
    await html({
        fileName: typeof options.html === 'string' ? options.html : fileName,
        cssFileName: typeof options.css === 'string' ? options.css : fileName,
        jsFileName: typeof options.js === 'string' ? options.js : fileName,
        withCss: options.css || options.all,
        withJs: options.js
      }
    )
  }
  
  if (options.css || options.all) {
    css(typeof options.css === 'string' ? options.css : fileName)
  }
  
  if (options.js) {
    js(typeof options.js === 'string' ? options.js : fileName)
  }
  
  if (options.img || options.all) {
    img()
  }
  
  if (options.readme || options.all) {
    readme(fileName)
  }
  
  askForInitialCommit()
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
    .option('-j, --js [fileName]', 'Basic JS (default: main.js)')
    .option('-i, --img', 'Basic Imgs')
    .showHelpAfterError()
    .action(execute)
}

module.exports.scaffoldExecute = execute
