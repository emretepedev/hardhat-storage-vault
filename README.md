# hardhat-storage-vault

Hardhat plugin to check and lock the storage layout of contracts.

## What

This plugin will help you avoid possible errors by checking and locking your storage layout.

## Installation

```bash
npm install hardhat-storage-vault
```

Import the plugin in your `hardhat.config.js`:

```js
require("hardhat-storage-vault");
```

Or if you are using TypeScript, in your `hardhat.config.ts`:

```ts
import "hardhat-storage-vault";
```

## Tasks

This plugin adds `storage-check` and `storage-lock` task to Hardhat:

````
Usage: hardhat [GLOBAL OPTIONS] finder [OPTIONS] [path] [name] [...outputs]
$ hardhat storage-check --compile

Error in plugin hardhat-storage-vault:
Invalid slot value!
  Contract path: contracts/Example.sol
  Contract name: Example
    Slot name: slot0
    Slot (Expected): 1
    Slot (Actual): 0


Usage: hardhat [GLOBAL OPTIONS] finder [OPTIONS] [path] [name] [...outputs]
$ hardhat storage-lock --prettify --override

Success in plugin hardhat-storage-vault:
Create storage-store-lock.json file.

## Configuration

This plugin extends the `HardhatUserConfig`'s `FinderUserConfig` object with the `finder` field.

This is an example of how to set it:

```js
module.exports = {
  storageVault: {
  	check: {
      storePath: "storage-store.json",
      compile: false,
    },
  	lock: {
      excludeContracts: ["contracts/Outdated.sol"],
      storeFile: "storage-store-lock.json",
      prettify: false,
      override: false,
      compile: false,
    },
  },
};
````

| Task  | Option           | Type       | Default                 | Description                                                      |
| ----- | ---------------- | ---------- | ----------------------- | ---------------------------------------------------------------- |
| Check | storePath        | _String_   | storage-store.json      | Use a specific JSON file as a storage store.                     |
| Check | compile          | _Boolean_  | false                   | Compile with Hardhat before running this task.                   |
| Vault | excludeContracts | _String[]_ | []                      | Fully qualified name of contracts to ignore.                     |
| Vault | storeFile        | _String_   | storage-store-lock.json | Create or update a specific JSON file to save the storage store. |
| Vault | prettify         | _Boolean_  | false                   | Save the file by formatting.                                     |
| Vault | override         | _Boolean_  | false                   | Override if there is a store file with the same name.            |
| Vault | compile          | _Boolean_  | false                   | Compile with Hardhat before running this task.                   |
