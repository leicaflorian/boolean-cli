#! /usr/bin/env node
const { program } = require("commander");
const mainCommands = require("../scripts/commands/main")
const configCommands = require("../scripts/commands/config")
const renameCommands = require("../scripts/commands/rename")
const scaffoldCommands = require("../scripts/commands/scaffold.js")
const repoCommands = require("../scripts/commands/repo")

const conf = configCommands(program)

mainCommands(program, conf)
renameCommands(program, conf)
scaffoldCommands(program, conf)
repoCommands(program, conf)

program.parse();
