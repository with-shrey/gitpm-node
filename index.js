#! /usr/bin/env node

const { program } = require('commander')
const path = require('path');
const fs = require('fs/promises');
const chalk = require('chalk');
const { URL } = require('url');
const { asyncChildProcess, checkFileExists } = require('./utils');
const {getUserNameAndPassword} = require('./promptInput');
const {spawnNpmInstall} = require('./npmHelper');
const Promise = require('bluebird');
const HOME_DIR = require('os').homedir();

async function checkAuthForGit(url) {
  try {
    const response = await asyncChildProcess(`if git ls-remote ${url} &> /dev/null ; then echo 1 ; else echo 0; fi`)
    return Number(response) === 1;
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

async function getGitUrlsFromDeps(deps){
  const domains = new Set();
  await Promise.map(deps, async function(dep) {
      const checkingLog = chalk.yellow('Checked ') + chalk.magenta(dep + ' : ');
      if (dep.startsWith('git+https://')){
        const hostName = new URL(dep).hostname;
        const isAuthenticated = await checkAuthForGit(dep.replace('git+https://', 'https://'));
        if(!isAuthenticated) {
          console.log(checkingLog + chalk.red(' Needs Auth ❌'));
          domains.add(hostName);
        } else {
          console.log(checkingLog + chalk.green('No Auth needed ✅'));
        }
      }
  }, {
    concurrency: 5,
  })
  return Array.from(domains);
}

function getAllDependencies(packageData) {
  const dependenciesList = Object.values(packageData.dependencies);
  if(packageData.devDependencies) {
    dependenciesList.push(...Object.values(packageData.devDependencies))
  }
  return dependenciesList;
}

async function runNpmInstall(extraArgs) {
  console.log(chalk.yellow(`Running Npm Install in current directory with args ${extraArgs.join(' ')} ...`));
  await spawnNpmInstall(extraArgs);
}


let systemCredentialsStore = '', globalCredentialsStore = '';
async function install() {
  // Get Git initial credentials config 
  systemCredentialsStore = await asyncChildProcess(`git config --system credential.helper`)
  globalCredentialsStore = await asyncChildProcess(`git config --global credential.helper`)
  try{
  // Get all extra options provided to command
  const extraArgs = [ ...process.argv ];
  extraArgs.splice(0, 3);
  
  const pathOfCurrentDirectory = process.cwd();
  console.log(chalk.yellow('Looking for package.json in directory: %s'), pathOfCurrentDirectory);
  const packageJsonPath = path.join(pathOfCurrentDirectory, 'package.json');
  const packageJsonExists = await checkFileExists(packageJsonPath);
  if(!packageJsonExists){ 
    console.log(
      chalk.red.bold(`package.json not found at ${packageJsonPath}`)
    );
    process.exit(1);
  }
  let packageData = JSON.parse(await fs.readFile(packageJsonPath));
  console.log(chalk.yellow('Getting git dependencies from package.json: %s'), packageJsonPath);
  const dependenciesList = getAllDependencies(packageData);
  const domains = await getGitUrlsFromDeps(dependenciesList);
  if(domains.length === 0) {
    await runNpmInstall(extraArgs);
    return;
  }
  const authJsonPath = path.join(pathOfCurrentDirectory, 'auth.json');
  console.log(chalk.cyan('Checking for existing auth.json at %s'), authJsonPath);
  const authJsonExists = await checkFileExists(authJsonPath);
  let authData = {};
  if(authJsonExists) {
    authData = JSON.parse(await fs.readFile(authJsonPath));
    console.log(chalk.green('auth.json exists'));
  } else {
    console.log(chalk.cyan('Will prompt for credentials for all domains'), authJsonPath);
    for (domain of domains) {
      if(!authData[domain] || !authData[domain].username || !authData[domain].password){
        const {username, password} = await getUserNameAndPassword(domain);
        
        authData[domain] = { username, password };
      }
    }
    await fs.writeFile(authJsonPath ,JSON.stringify(authData, null, 2));
  }
  const credentials = [];
  await Promise.map(Object.entries(authData), async function([domain, creds]) {
    credentials.push(`https://${creds.username}:${creds.password}@${domain}`)
  });
  const configFilePath = path.join(HOME_DIR, '.git_credentials_npm');
  // await fs.writeFile(configFilePath, credentials.join(''));
  await asyncChildProcess(`git config --global credential.helper "store --file=${configFilePath}" --replace-all`)
  await asyncChildProcess(`git config --system credential.helper "store --file=${configFilePath}" --replace-all`)
  await runNpmInstall(extraArgs);
} catch(e){
  console.error(e);
} finally {
  exitHandler(systemCredentialsStore, globalCredentialsStore)
}
}

async function exitHandler(systemCredentialsStore, globalCredentialsStore) {
  console.log('Cleaning Up Git Config');
  try {
    await asyncChildProcess(`git config --system credential.helper ${systemCredentialsStore} --replace-all`)
    await asyncChildProcess(`git config --global credential.helper ${globalCredentialsStore} --replace-all`)
  } catch(e) {
    console.error('Error cleaning up Git Config');
  }
  console.log('COMPLETE');
  process.exit(0);
}

program
    .command('install-deps')
    .description('Setup authentication and perform npm install')
    .allowUnknownOption()
    .action(() => {
      install()
    })
program.parse()
