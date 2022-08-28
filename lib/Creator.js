const inquirer = require('inquirer');
const chalk = require('chalk')
const ora = require('ora');

const { fetchRepoList } = require('./request');

async function loading(msg, fn) {
    let result
    let spinner = ora(msg);
    spinner.start();
    try {
        result = await fn()
        spinner.succeed();
        return result
    } catch (error) {
        spinner.fail()
        console.log();
        console.log(`${chalk.bgRed(`Somthing wrong happened, just try again.`)}`);
        console.log();
    }
}

module.exports = class Creator {

    constructor(projectName, targetDir) {
        this.name = projectName
        this.target = this.targetDir
    }

    async fetchRepo() {
        let repos = await loading(`fetching repos ...`, async () => await fetchRepoList('users', 'bestkwanwa'))
        if (!repos) return
        repos = repos.filter(repo => /.*template.*/.test(repo.name)).map(repo => repo.name)
        if (repos.length > 0) {
            let { repo } = await inquirer.prompt({
                name: 'repo',
                type: 'list',
                choices: repos,
                message: 'Just select a repo as template.'
            })
            return repo
        }
    }

    async fetchTag() {

    }

    async download() {

    }

    async create(cliOptions) {
        let repo = await this.fetchRepo()
        if (!repo) return
    }


}
