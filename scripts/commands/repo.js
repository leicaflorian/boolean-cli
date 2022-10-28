const fsExtra = require('fs-extra')
const fs = require('fs')
const path = require('path')
const { startCase, upperFirst } = require('lodash')
const { Command, program } = require('commander')

const shell = require('shelljs')
const chalk = require('chalk')

const prefix = '[REPO]'

const { info, warn, error } = require('../utilities/logs')
const inquirer = require('inquirer')

const { scaffoldExecute } = require('./scaffold.js')
const child_process = require('child_process')
const { writeSection } = require('../utilities/ui')

// Create repo
// gh repo create Florian-Bool-79/js_condition --private

// clone repo
// gh repo clone Florian-Bool-79/js_condition && cd js_condition

// faccio lo scaffolding
// eseguo subito un primo commit per inizializzare la repo

// chiedo se aprire con vscode

function _formatVisibility (isPublic, ucFirst = false) {
  let visibility = isPublic ? 'public' : 'private'
  const color = isPublic ? 'green' : 'cyan'
  
  if (ucFirst) {
    visibility = upperFirst(visibility)
  }
  
  return chalk[color].bold(visibility)
}

function checkGHCLI () {
  info(prefix, 'Checking github-cli installation...')
  
  if (!shell.which('gh')) {
    error(`Sorry, this script requires ${chalk.red.bold('\'github-cli\'')}.
          Before proceeding please download it at https://cli.github.com/.
          After downloading it, please login with ${chalk.yellow.bold('\'gh auth login\'')}`)
    shell.exit(1)
  }
  
  if (shell.exec('gh auth status', { silent: true }).code === 1) {
    error(`Sorry, you're not logged in to github-cli.
  Please login with ${chalk.yellow.bold('\'gh auth login\'')}.
  For more info, visit https://cli.github.com/manual/gh_auth_login`)
  }
}

function checkGITCLI () {
  info(prefix, 'Checking git-cli installation...')
  
  if (!shell.which('git')) {
    error(`Sorry, this script requires ${chalk.red.bold('\'git-cli\'')}.
  Before proceeding plead download it at https://git-scm.com/downloads`)
    shell.exit(1)
  }
}

function createRepo (name, organization, isPublic, existIgnore) {
  let repoName = name
  
  if (organization) {
    repoName = `${organization}/${name}`
  }
  
  info(prefix, `Creating ${_formatVisibility(isPublic)} repo ${chalk.yellow.bold(repoName)}...`)
  
  const res = shell.exec(`gh repo create ${repoName} --${isPublic ? 'public' : 'private'}`, { silent: true })
  
  if (res.code === 0 || existIgnore) {
    if (res.code !== 0) {
      warn(`Error while creating repo ${chalk.yellow.bold(repoName)}.
            ${res.stderr}`)
      info(prefix, `Trying to continue anyway...`)
    } else {
      info(prefix, `${_formatVisibility(isPublic, true)} repo ${chalk.yellow.bold(repoName)} created at ${chalk.yellow.bold(res.stdout)}`)
    }
    
    // Start cloning repo
    cloneRepo(name, repoName)
  } else {
    error(`Error while creating repo ${chalk.yellow.bold(repoName)}.
            ${res.stderr}`)
    shell.exit(1)
  }
}

function cloneRepo (projName, repoName) {
  info(prefix, `Cloning repo to ${chalk.yellow.bold(projName)}...`)
  
  const res = shell.exec(`gh repo clone ${repoName} && cd ${projName}`, { silent: true })
  const repoPath = path.resolve(projName)
  
  if (res.code === 0) {
    info(prefix, `Repo cloned at ${chalk.green.bold(repoPath)}`)
    shell.cd(projName)
    createScaffolding(projName)
  } else {
    error(`Error while cloning repo ${chalk.yellow.bold(repoName)}.
            ${res.stderr}`)
    shell.exit(1)
  }
}

function createScaffolding (projName) {
  inquirer
    .prompt([
      {
        name: 'create_scaffolding',
        message: `Vuoi creare lo scaffolding iniziale per questo progetto?`,
        type: 'confirm',
        default: true
      }
    ])
    .then((answers) => {
      if (answers.create_scaffolding) {
        scaffoldExecute('', {})
      }
    })
    .catch((error) => {
      console.log(error)
      if (error.isTtyError) {
        // Prompt couldn't be rendered in the current environment
      } else {
        // Something else went wrong
      }
    })
}

function deleteRepo (name, organization) {
  let repoName = name
  
  if (organization) {
    repoName = `${organization}/${name}`
  } else if (!name.includes('/')) {
    const data = shell.exec('gh repo list --json name,nameWithOwner', { silent: true })
    const repoList = JSON.parse(data.stdout)
    
    const foundedRepo = repoList.find((repo) => repo.name === repoName)
    
    if (!foundedRepo) {
      error(`Repo ${chalk.yellow.bold(repoName)} not found.`)
      shell.exit(1)
    }
    
    repoName = foundedRepo.nameWithOwner
  }
  
  inquirer.prompt([
    {
      name: 'delete_repo',
      message: `Sei sicuro di voler eliminare definitivamente la repo ${chalk.yellow.bold(repoName)}?`,
      type: 'confirm',
      default: false
    }]
  ).then((answers) => {
    if (answers.delete_repo) {
      const deleteRes = shell.exec(`gh repo delete ${repoName} --confirm`)
      
      if (deleteRes.code === 0) {
        info(prefix, `Repo ${chalk.yellow.bold(repoName)} deleted`)
      }
      
      // TODO:: would be nice to also ask if delete the local folder
    }
  })
}

/**
 * should allow the user to automatically create a repo, clone it and initialize a project inside
 * @param {Command} program
 */
module.exports = function (program) {
  program
    .command('repo')
    .description('Create a remote repo, clones it and eventually scaffolds its files.')
    .argument('<repo_title>', 'Title of the repo will be created')
    .usage('repo_title [organization] [option]')
    .option('-o, --org <org>', 'organization where to create the repo')
    .option('-p, --public', 'create a public repo')
    .option('-d, --delete', 'delete a repo irreversibly')
    .option('-ei, --existIgnore', 'Ignore if the repo already exists and continue cloning it')
    /**
     * @param {string} fileName
     * @param {{org, existIgnore}} options
     */
    .action((repoTitle, options) => {
      let organization = options.org ? options.org.replace(/^=/, '') : null
      
      writeSection('REPO')
      
      if (options.delete) {
        deleteRepo(repoTitle, organization)
        return
      }
      
      checkGITCLI()
      checkGHCLI()
  
      /**
       * Currently each function calls the next one, so we can't use async/await
       * Would be nice to refactor this
       * and make each function return a promise
       * and use the result for the next function
       */
      createRepo(repoTitle, organization, options.public, options.existIgnore)
      
      // TODO:: After scaffolding, would be nice to ask if push the repo
    })
}
