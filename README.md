# hardhat-storage-vault

Hardhat plugin to check and lock the storage layout of contracts.

## What

This plugin will help you avoid possible errors by checking and locking your storage layout.

## Installation

I recommend using npm 7 or later. If you do that, then you just need to install the plugin itself:

```bash
npm install hardhat-storage-vault
```

If you are using an older version of npm, you'll also need to install all the packages used by `hardhat-storage-vault`.

```bash
npm install hardhat-storage-vault hardhat-finder
```

That's also the case if you are using yarn.

```bash
yarn add hardhat-storage-vault hardhat-finder
```

---

Import `hardhat-storage-vault` in your Hardhat config. This will make import of `hardhat-finder` redundant, so you can remove it if you want:

Import the plugin in your `hardhat.config.js`:

```js
require("hardhat-storage-vault");
require("hardhat-finder"); // you can remove this line
```

Or if you are using TypeScript, in your `hardhat.config.ts`:

```ts
import "hardhat-storage-vault";
import "hardhat-finder"; // you can remove this line
```

## Tasks

This plugin adds `storage-check` and `storage-lock` tasks to Hardhat:

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
      excludeContracts: [
        "^contracts-exposed/" // exclude by directory
        "^contracts/Example.sol" // exclude by file
        "Example$" // exclude by contract name
        "^contracts/Example.sol:Example$" // exclude by fully qualified name
        "Example.+\\.sol" // regex search (exclude ExampleTwo.sol, ExampleThree.sol but not Example.sol)
        "Example.*\\.sol" // regex search (exclude Example.sol, ExampleTwo.sol, ExampleThree.sol)
      ],
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
| Vault | excludeContracts | _String[]_ | []                      | Regex string to ignore contracts.                                |
| Vault | storeFile        | _String_   | storage-store-lock.json | Create or update a specific JSON file to save the storage store. |
| Vault | prettify         | _Boolean_  | false                   | Save the file by formatting.                                     |
| Vault | overwrite        | _Boolean_  | false                   | Overwrite if there is a store file with the same name.           |
