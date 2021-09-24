const childProcess = require('child_process');
const fsPromise = require('fs/promises');
const fs = require('fs');
const Promise = require('bluebird');

module.exports = {
  asyncChildProcess(cmd, printLog = false) {
    return new Promise((resolve, reject) => {
      childProcess.exec(cmd, (error, out, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        if (printLog) {
          console.log({ error, out, cmd, stderr });
        }
        resolve(out);
      });
    });
  },

  checkFileExists(file) {
    return fsPromise
      .access(file, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false);
  },
};
