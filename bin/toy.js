#!/usr/bin/env node

const program = require('commander');

const chalk = require('chalk');

const packageJson = require('../package.json');

program
    .command(`create <project-name>`)
    .description(`create a new project`)
    .option('-f, --force', 'Overwrite target directory if it exists')
    .action((name, options, command) => {
        require('../lib/create')(name, options)
    })

program
    .command(`config [value]`)
    .description(`inspect and modify the config`)
    .option(`-g, --get <path>`, `get value from option`)
    .option(`-s, --set <path> <value>`, `set option value`)
    .option(`-d, --delete <path>`, `delete option from config`)
    .action((value, options) => {
        console.log(value, options);
        // require('../lib/config')(value, options)
    })

program
    .command(`ui`)
    .description(`start and open the cli ui`)
    .option(`-p, --port <port>`, `Port used for the UI server`)
    .action((options) => {
        console.log(options);
    })

program
    .version(`toy-cli ${packageJson.version}`)
    .usage(`<command> [option]`)

program.on('--help', () => {
    console.log()
    console.log(`  ${chalk.greenBright(`----------!!!----------`)}`)
    console.log()
    console.log(`  Run ${chalk.cyan(`toy <command> --help`)} for detailed usage of given command.`)
    console.log()
    console.log(`  ${chalk.greenBright(`----------!!!----------`)}`)
})

program.parse(process.argv)


