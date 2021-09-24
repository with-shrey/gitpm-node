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
gitpm-node install --save <PACKAGE>
```

> the above commands will prompt for git credentialsa and create a `auth.json` in the same directory as `package.json` containing the git http credentials

> In case if auth.json exists, it will be used without prompt
