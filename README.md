# Vuelean Cli

This is simple cli created for Boolean students and tutors to simplify the job of each one of them.

## What does it do?

- **prepare_for_build**:
    - from **.gitignore** removes "/dist" folder
    - in **.eslintrc.js** adds `"ignorePatterns": [
      "dist/*"
      ]`
    - in **package.json** adds this
      script: `"build_push": "npm run build && git add --renormalize . && git commit -n -m \"Created/Updated build\" && git push"`
    - in **vue.config.js** updates publicPath to `./`. If the file does not exist, adds it.

## How to install

For this cli a global installation in preferred, so just run the following command:

```shell
npm i -g vuelean-cli 
```

## How to use

Via terminal, navigate to the folder of an existing vue-cli project and from there, in the terminal, run

```shell
npx vuelean-cli prepare_for_build
```
