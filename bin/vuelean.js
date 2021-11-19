#! /usr/bin/env node

const { program } = require("commander");
const { updateEsLintConfig } = require("../scripts/handleEsLintConfig");
const { updateVueConfig } = require("../scripts/handleVueConfig");
const { updateGitIgnore } = require("../scripts/handleGitIgnore");
const { updatePackageJson } = require("../scripts/handlePackageJson");

program.command("prepare_for_build").description("List all the TODO tasks").action(list);

function list () {
  updateGitIgnore();
  updateEsLintConfig();
  updateVueConfig();
  updatePackageJson();
  
  console.log(`✓ [OK] Tutte le configurazioni sono state aggiornate.
        Ora puoi eseguire
        \`npm run build_push\`
        per eseguire la build e pushare le modifiche.
        Ricordati di farlo molto spesso!!!!`);
}

program.parse();
