const { spawn } = require('child_process');
const chalk = require('chalk');
const fs = require('fs/promises');
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
      env: process.env,
    });
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (data) => {
      // Here is where the output goes
      process.stdout.write(data);
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (data) => {
      // Here is where the error output goes
      process.stderr.write(data);
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
  return JSON.parse(await fs.readFile(packageJsonPath));
}

module.exports = {
  spawnNpmInstall,
  getAllDependencies,
  getPackageJsonData,
};
