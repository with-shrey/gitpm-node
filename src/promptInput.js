const prompt = require('prompt');
const chalk = require('chalk');
const Promise = require('bluebird');

const basicAuthSchema = {
  properties: {
    username: {
      required: true,
      description: chalk.magenta('Enter your username'),
    },
    password: {
      hidden: true,
      required: true,
      description: chalk.magenta('Enter your password'),
    },
  },
};

module.exports = {
  getUserNameAndPassword(domain) {
    console.log(chalk.magenta(`Credentials for ${domain}`));
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
