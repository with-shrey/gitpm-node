const childProcess = require('child_process');
const fsPromise = require('fs/promises');
const fs = require('fs');

module.exports = {
  asyncChildProcess(cmd, printLog = false) {
    return new Promise((resolve, reject) => {
      childProcess.exec(cmd, (error, out) => {
        if (printLog) {
          console.log({ error, out, cmd })
        }
        if(error){
          reject(error);
          return;
        }
        resolve(out);
      })
    })
  },
  
  checkFileExists(file) {
    return fsPromise.access(file, fs.constants.F_OK)
             .then(() => true)
             .catch(() => false)
  }
  
}