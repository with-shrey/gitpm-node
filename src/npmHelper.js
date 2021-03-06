const { spawn } = require('child_process');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const { checkFileExists } = require('./utils');

function spawnNpmInstall(args = []) {
  console.log(
    chalk.yellow(
      `Running Npm Install in current directory with args ${args.join(' ') || '[]'} ...`,
    ),
  );
  return new Promise((resolve) => {
    const child = spawn('npm', ['install', ...(args || [])], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        GIT_SSL_NO_VERIFY: true,
      },
      stdio: 'inherit',
    });

    child.on('close', () => {
      // Here you can get the exit code of the script
      console.log('DONE!');
      resolve();
    });
  });
}

function getAllDependencies(packageData) {
  const dependenciesList = [];
  if (packageData.dependencies) {
    dependenciesList.push(...Object.values(packageData.dependencies));
  }
  if (packageData.devDependencies) {
    dependenciesList.push(...Object.values(packageData.devDependencies));
  }
  return dependenciesList;
}

async function getPackageJsonData() {
  const pathOfCurrentDirectory = process.cwd();
  console.log(chalk.yellow('Looking for package.json in directory: %s'), pathOfCurrentDirectory);
  const packageJsonPath = path.join(pathOfCurrentDirectory, 'package.json');
  const packageJsonExists = await checkFileExists(packageJsonPath);
  if (!packageJsonExists) {
    console.log(chalk.red.bold(`package.json not found at ${packageJsonPath}`));
    throw new Error('Package.json not Found');
  }
  return JSON.parse(await fs.readFileSync(packageJsonPath));
}

module.exports = {
  spawnNpmInstall,
  getAllDependencies,
  getPackageJsonData,
};
