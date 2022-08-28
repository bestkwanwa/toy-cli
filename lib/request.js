const axios = require('axios');

axios.interceptors.response.use(res => res.data)

/**
 * get repo list by type and name
 * https://api.github.com/${type}/${name}/repos
 */
async function fetchRepoList(type, name) {
    return axios.get(`https://api.github.com/${type}/${name}/repos`)
}

/**
 * https://api.github.com/repos/${user-name}/${repo-name}/tags
 */
async function fetchTagList(userName, repoName) {
    return axios.get(`https://api.github.com/repos/${userName}/${repoName}/tags`)
}

module.exports = {
    fetchRepoList,
    fetchTagList
}