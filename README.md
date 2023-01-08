# hardhat-storage-vault

Hardhat plugin to check and lock the storage layout of contracts.

## What

This plugin will help you avoid possible errors by checking and locking your storage layout.

## Installation

Install the plugin via `npm`:

```bash
npm install hardhat-storage-vault
```

Install the plugin via `yarn`:

```bash
yarn add hardhat-storage-vault
```

---

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

```
Usage: hardhat [GLOBAL OPTIONS] storage-lock [--overwrite] [--prettify] [--store-file <STRING>] [...excludeContracts]
$ hardhat storage-lock --prettify --overwrite

Success in plugin hardhat-storage-vault:
Created storage-store-lock.json file.


Usage: hardhat [GLOBAL OPTIONS] storage-check [--store-file <INPUTFILE>]
$ hardhat storage-check --store-file custom-storage-store-lock.json

Error in plugin hardhat-storage-vault:
Invalid slot value!
  Contract path: contracts/Example.sol
  Contract name: Example
    Slot name: foo
    Slot (Expected): 1
    Slot (Actual): 0
```

## Configuration

This plugin extends the `HardhatUserConfig`'s `StorageVaultConfig` object with the `storageVault` field.

This is an example of how to set it:

```js
module.exports = {
  storageVault: {
    check: {
      storeFile: "storage-store-lock.json",
    },
    lock: {
      excludeContracts: ["contracts/Example.sol"],
      storeFile: "storage-store-lock.json",
      prettify: false,
      overwrite: false,
    },
  },
};
```

| Task  | Option           | Type       | Default                 | Description                                                      |
| ----- | ---------------- | ---------- | ----------------------- | ---------------------------------------------------------------- |
| Check | storeFile        | _String_   | storage-store-lock.json | Use a specific JSON file as a storage store.                     |
| Vault | excludeContracts | _String[]_ | []                      | Fully qualified name of contracts to ignore.                     |
| Vault | storeFile        | _String_   | storage-store-lock.json | Create or update a specific JSON file to save the storage store. |
| Vault | prettify         | _Boolean_  | false                   | Save the file by formatting.                                     |
| Vault | overwrite        | _Boolean_  | false                   | Overwrite if there is a store file with the same name.           |
