const path = require('path');
const chalk = require('chalk');
const fs = require('fs');
const Promise = require('bluebird');
const { checkFileExists } = require('./utils');
const { getUserNameAndPassword } = require('./promptInput');
const { AUTH_FILE } = require('./constants');

let authData = {};
const pathOfCurrentDirectory = process.cwd();
const authJsonPath = path.join(pathOfCurrentDirectory, AUTH_FILE);

async function loadAuthJsonFile() {
  console.log(chalk.green(`${AUTH_FILE} exists`));
  authData = JSON.parse(await fs.readFileSync(authJsonPath));
  return authData;
}

async function populateAuthJsonFromCli(domains) {
  console.log(chalk.cyan('Will prompt for credentials for all domains'), authJsonPath);
  await Promise.mapSeries(domains, async (domain) => {
    if (!authData[domain] || !authData[domain].username || !authData[domain].password) {
      const { username, password } = await getUserNameAndPassword(domain);

      authData[domain] = { username, password };
    }
  });
  await fs.writeFileSync(authJsonPath, JSON.stringify(authData, null, 2));
}

async function getAuthJsonContents(domains) {
  console.log(chalk.cyan('Checking for existing %s at %s'), AUTH_FILE, authJsonPath);
  const exists = await checkFileExists(authJsonPath);
  if (exists) {
    await loadAuthJsonFile();
  } else {
    await populateAuthJsonFromCli(domains);
  }
  return authData;
}

module.exports = {
  getAuthJsonContents,
};
