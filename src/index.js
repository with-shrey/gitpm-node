#! /usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const { spawnNpmInstall, getAllDependencies, getPackageJsonData } = require('./npmHelper');
const { getGitUrlsFromDeps } = require('./gitHelper');
const { getAuthJsonContents } = require('./authDataStore');

const GitStoreManager = require('./GitStoreManager');

let credentialsStoreManager;

async function install() {
  try {
    // Get all extra options provided to command
    const extraArgs = [...process.argv];
    extraArgs.splice(0, 3);
    await credentialsStoreManager.initStore();
    // Get Packege.JSON
    const packageData = await getPackageJsonData();
    // Parse dependencies and check for git+http deps
    console.log(chalk.yellow('Getting git dependencies from package.json'));
    const dependenciesList = await getAllDependencies(packageData);
    let domains = await getGitUrlsFromDeps(dependenciesList);
    const newPackageDomains = await getGitUrlsFromDeps(extraArgs);
    // check if any git http url is passed in args (In case of cli install --save package-path)
    domains.push(...newPackageDomains);
    domains = Array.from(new Set(domains));
    console.log(chalk.cyan('Git domains requesting authentication: %s'), domains.join(','));
    // If no git repo exists then npm install and exit
    if (domains.length === 0) {
      await spawnNpmInstall(extraArgs);
      return 0;
    }
    const authData = await getAuthJsonContents(domains);
    // Add credentials to git store
    await credentialsStoreManager.addCredentialsToStore(authData);
    await spawnNpmInstall(extraArgs);
    return 0;
  } catch (e) {
    console.error(e);
    return 1;
  }
}

program
  .command('install')
  .description('Setup authentication and perform npm install')
  .allowUnknownOption()
  .action(async () => {
    credentialsStoreManager = new GitStoreManager();
    const exitCode = await install();
    console.log(exitCode);
    await credentialsStoreManager.restoreSettings();
    process.exit(exitCode || 1);
  });
program.parse();
