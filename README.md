# hardhat-storage-check

Hardhat plugin to check the storage layout of contracts.

## What

This plugin will help you avoid possible errors by controlling your storage layout.

## Installation

```bash
npm install hardhat-storage-check
```

Import the plugin in your `hardhat.config.js`:

```js
require("hardhat-storage-check");
```

Or if you are using TypeScript, in your `hardhat.config.ts`:

```ts
import "hardhat-storage-check";
```

## Tasks

This plugin adds the `hardhat-storage-check` task to Hardhat:

```
Usage: hardhat [GLOBAL OPTIONS] finder [OPTIONS] [path] [name] [...outputs]
$ hardhat storage-check

## Environment extensions

This plugin extends the Hardhat Runtime Environment by adding an `storageCheck` field whose type is `Finder`.

## Configuration

This plugin extends the `HardhatUserConfig`'s `FinderUserConfig` object with the `finder` field.

This is an example of how to set it:

```js
module.exports = {
  storageCheck: {
  	configPath: "storage-check.json",
    noCompile: false,
    runOnCompile: false,
  },
};
```

| Option              | Type       | Default                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Description                                                         |
| ------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| configPath          | _String_   | storage-check.json                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Config path of the plugin.                            |
| noCompile           | _Boolean_  | false                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Don't compile before running this task.                             |
| runOnCompile        | _Boolean_  | false                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Run finder task during compile task.                                |

## Usage

There are no additional steps you need to take for this plugin to work.

Install it and access ethers through the Hardhat Runtime Environment anywhere you need it (tasks, scripts, tests, etc).

```ts
import { storageCheck } from "hardhat";

async function main() {
  const makeSureStorage = await storageCheck.check();
  console.log(makeSureStorage); // true
}
```
