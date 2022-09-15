const path = require('path');
const { promisify } = require('util');
const inquirer = require('inquirer');
const chalk = require('chalk')
const ora = require('ora');
const download = require('./download');
const spawn = require('cross-spawn');

const { fetchRepoList, fetchTagList } = require('./request');

const SUCCEEDED = 1
const FAILED = 0

function log(msg, color) {
    console.log()
    console.log(`${chalk[color](`${msg}`)}`);
    console.log()
}

async function loading(msg, fn) {
    let result
    let spinner = ora(msg);
    spinner.start();
    try {
        result = await fn()
        spinner.succeed();
        return result || SUCCEEDED
    } catch (error) {
        spinner.fail()
        return FAILED
    }
}

module.exports = class Creator {

    constructor(projectName, targetDir) {
        this.name = projectName
        this.target = targetDir
    }

    async fetchRepo(userType, userName) {
        let repos = await loading(`fetching repos ...`, async () => await fetchRepoList(userType, userName))
        if (!repos) return
        repos = repos.filter(repo => /(.*template.*|.*starter.*)/.test(repo.name)).map(repo => repo.name)
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

    async fetchTag(userName, repoName) {
        let tags = await loading(`fetching versions by tags ...`, async () => await fetchTagList(userName, repoName))
        if (!tags) return
        let { tag } = await inquirer.prompt({
            name: 'tag',
            type: 'list',
            choices: tags,
            message: 'Just select a version.'
        })
        return tag
    }

    async downloadRepoByTag(userName, repo, tag) {
        const promisifiedDownload = promisify(require('download-git-repo'))
        const requestUrl = `${userName}/${repo}${tag ? `#${tag}` : ''}`
        return await loading(`fetching template ...`, async () => await promisifiedDownload(requestUrl, this.target))
    }

    async downloadRepoByUrl(url) {
        return await loading(`fetching template ...`, async () => await download(url, this.target))
    }

    async install() {
        process.chdir(this.target);    // 改成新建目录
        return new Promise((resolve, reject) => {
            const command = 'yarnpkg'
            const childProcess = spawn(command, { stdio: 'inherit' })
            childProcess.on('close', () => {
                resolve(SUCCEEDED)
            })
        })
    }

    async create() {
        let { fetchType } = await inquirer.prompt({
            name: 'fetchType',
            type: 'list',
            choices: ['input', 'select'],
            message: 'Just select the type of fetching repo.'
        })
        let handleResult
        if (fetchType === 'input') {
            handleResult = await this.handleInput()
        } else if (fetchType === 'select') {
            handleResult = await this.handleSelect()
        }
        return handleResult
    }

    async handleInput() {
        let { repoUrl } = await inquirer.prompt({
            name: 'repoUrl',
            type: 'input',
            message: 'Just input the repo url like <username>/<repo>'
        })
        let downloadResult = await this.downloadRepoByUrl(repoUrl)
        if (!downloadResult) return FAILED
        return await this.handleInstall()
    }

    async handleSelect() {
        let { userType } = await inquirer.prompt({
            name: 'userType',
            type: 'list',
            choices: ['users', 'orgs'],
            message: 'Just select the type of github user.'
        })

        let { userName } = await inquirer.prompt({
            name: 'userName',
            type: 'input',
            message: 'Just enter your github user name.'
        })

        let repo = await this.fetchRepo(userType, userName)
        if (!repo) return FAILED
        let tag = await this.fetchTag(userName, repo)
        if (!tag) return FAILED
        let downloadResult = await this.downloadRepoByTag(userName, repo, tag)
        if (!downloadResult) return FAILED
        return await this.handleInstall()
    }

    async handleInstall() {
        log('installing dependencies ...', 'cyanBright')
        let installResult = await this.install()
        if (!installResult) return FAILED
        log('installing dependencies done.', 'cyanBright')
        log(`cd ${this.target}`, 'cyanBright')
        log(`and then`, 'white')
        log(`yarn start`, 'cyanBright')
        return SUCCEEDED
    }
}
