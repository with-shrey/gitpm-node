# [GitPM Node](https://npmjs.org/package/gitpm-node) &middot; [![npm version](https://img.shields.io/npm/v/gitpm-node.svg?style=flat)](https://www.npmjs.com/package/gitpm-node) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://reactjs.org/docs/how-to-contribute.html#your-first-pull-request)

GitPM-Node is a CLI tool that can enable you to install private git packages from npm without storing username and password in package.json

---

## Disclaimer

> ☠️ Use this tool only within a docker container

> We havent tested it on physical machines

## Installation

```
npm install -g gitpm-node@latest
```

## Usage

1. Install all dependencies

```
gitpm-node install
```

2. Install a new git/npm package

```
gitpm-node install --save git+https://<DOMAIN>/path/to/package.git
```

2. Normal npm dependencies can also be installed with options 

```
gitpm-node install --save <npm package name>
```

> the above commands will prompt for git credentials and create an `auth.json` in the same directory as `package.json` containing the git http credentials

> In case if auth.json exists, it will be used without any prompt (Usefull incase of CI/CD)

- Example `auth.json`
```
{
  "git.domain.com": {
    "username": "<username / token name>",
    "password": "<password / personal token>"
  }
}
```
