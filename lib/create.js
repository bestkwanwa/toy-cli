const path = require('path')
const fs = require('fs-extra')
const inquirer = require('inquirer');
const chalk = require('chalk')

const Creator = require('./Creator');

module.exports = async function (projectName, options) {
    const cwd = process.cwd()
    const targetDir = path.resolve(cwd, projectName)
    if (fs.existsSync(targetDir)) {
        if (options.force) {
            await fs.remove(targetDir)
        } else {
            const { action } = await inquirer.prompt([
                {
                    name: 'action',
                    type: 'list',
                    message: `Target directory ${chalk.cyan(targetDir)} already exists. Pick an action:`,
                    choices: [
                        { name: 'Overwrite', value: 'overwrite' },
                        { name: 'Cancel', value: false }
                    ]
                }
            ])
            if (!action) {
                return
            } else if (action === 'overwrite') {
                console.log();
                console.log(`\nRemoving ${chalk.cyan(targetDir)} ...`)
                console.log();
                await fs.remove(targetDir)
            }
        }
    }
    const creator = new Creator(projectName, targetDir)
    let result = await creator.create()
    if (!result) {
        console.log();
        console.log(`${chalk.bgRed(`Somthing wrong happened, just try again.`)}`);
        console.log();
    }
}