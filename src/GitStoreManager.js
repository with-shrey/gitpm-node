/* eslint-disable class-methods-use-this */
const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const HOME_DIR = require('os').homedir();
const { asyncChildProcess } = require('./utils');
const { GIT_STORE_FILENAME } = require('./constants');

class GitStoreManager {
  constructor() {
    this.previousStoreSetting = null;
  }

  async initStore() {
    try {
      this.previousStoreSetting = await asyncChildProcess(`git config --global credential.helper`);
    } catch (e) {
      console.warn('WARN: Error getting previous store setting, Will Skip');
    }
    try {
      await asyncChildProcess(`git config --global credential.helper store`);
    } catch (e) {
      console.warn('WARN: Error setting file store as default');
    }
  }

  async restoreSettings() {
    console.log('INFO: Cleaning Up Git Store Settings And restoring defaults');
    try {
      if (this.previousStoreSetting) {
        await asyncChildProcess(
          `git config --global --replace-all credential.helper "${this.previousStoreSetting}"`,
        );
        const configFilePath = path.join(HOME_DIR, GIT_STORE_FILENAME);
        await fs.unlinkSync(configFilePath);
      }
    } catch (e) {
      console.error('ERROR: Cleaning up Git Config', e);
    }
  }

  async addCredentialsToStore(authData) {
    const credentials = [];
    await Promise.map(Object.entries(authData), async ([domain, creds]) => {
      credentials.push(`https://${creds.username}:${creds.password}@${domain}`);
    });
    const configFilePath = path.join(HOME_DIR, GIT_STORE_FILENAME);
    await fs.writeFileSync(configFilePath, credentials.join('\n'));
    await asyncChildProcess(
      `git config --global --replace-all credential.helper "store --file=${configFilePath}"`,
    );
  }
}

module.exports = GitStoreManager;
