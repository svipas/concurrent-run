# concurrent-run &middot; [![Build Status](https://svipben.visualstudio.com/svipben/_apis/build/status/concurrent-run?branchName=master)](https://svipben.visualstudio.com/svipben/_build/latest?definitionId=2&branchName=master) [![NPM package](https://img.shields.io/npm/v/concurrent-run.svg)](https://www.npmjs.com/package/concurrent-run)

Simple, zero dependency, commands runner in concurrent mode.

## Installation

### Yarn

`yarn add --dev concurrent-run`

### NPM

`npm install --save-dev concurrent-run`

## Usage

`concurrent-run "command1 arg" "command2 arg"`

You should always surround multiple commands with quotes, otherwise, everything will be treated as a separate command.
