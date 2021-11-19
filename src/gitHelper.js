const { URL } = require('url');
const chalk = require('chalk');
const Promise = require('bluebird');
const { asyncChildProcess } = require('./utils');

async function checkAuthForGit(url) {
  const response = await asyncChildProcess(
    `if GIT_ASKPASS=/bin/echo GIT_TERMINAL_PROMPT=0 git ls-remote --exit-code ${url} >/dev/null 2>&1 ; then echo 1 ; else echo 0; fi`,
    false,
  );
  const result = Number(response) === 1;
  return result;
}

async function getGitUrlsFromDeps(deps) {
  const domains = new Set();
  await Promise.map(
    deps,
    async (dep) => {
      const checkingLog = chalk.yellow('Checked ') + chalk.magenta(`${dep} : `);
      if (dep.startsWith('git+https://')) {
        const urlParsed = new URL(dep);
        const hostName = urlParsed.hostname;
        const isAuthenticated = await checkAuthForGit(
          `${'https://'}${urlParsed.host}${urlParsed.pathname}`,
        );
        if (!isAuthenticated) {
          console.log(checkingLog + chalk.red(' Needs Auth ❌'));
          domains.add(hostName);
        } else {
          console.log(checkingLog + chalk.green('No Auth needed ✅'));
        }
      }
    },
    {
      concurrency: 5,
    },
  );
  return Array.from(domains);
}

module.exports = {
  getGitUrlsFromDeps,
};
