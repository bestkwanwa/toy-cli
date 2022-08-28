const axios = require('axios');

axios.interceptors.response.use(res => res.data)

/**
 * get repo list by type and name
 * https://api.github.com/${type}/${name}/repos
 */
async function fetchRepoList(type, name) {
    return axios.get(`https://api.github.com/${type}/${name}/repos`)
}

module.exports = {
    fetchRepoList
}