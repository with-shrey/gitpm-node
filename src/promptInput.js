const prompt = require('prompt');
const chalk = require('chalk');
const Promise = require('bluebird');

const basicAuthSchema = {
  properties: {
    username: {
      required: true,
      description: chalk.bgBlue.white('Enter your username'),
    },
    password: {
      hidden: true,
      required: true,
      description: chalk.bgBlue.white('Enter your password'),
    },
  },
};

module.exports = {
  getUserNameAndPassword(domain) {
    console.log(chalk.bgBlue.white(`Credentials for ${domain}`));
    prompt.start();
    return new Promise((resolve, reject) => {
      prompt.get(basicAuthSchema, (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      });
    });
  },
};
