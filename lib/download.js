const path = require('path');
const download = require('download-git-repo')

module.exports = function (repoUrl, target) {
    return new Promise((resolve, reject) => {
        download(repoUrl,
            target, { clone: true }, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(target)
                }
            })
    })
}