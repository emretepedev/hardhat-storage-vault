import { readFileSync, existsSync } from "fs";
import { TASK_COMPILE } from "hardhat/builtin-tasks/task-names";
import { HardhatPluginError } from "hardhat/plugins";
import type { ActionType } from "hardhat/types";

import { PLUGIN_NAME } from "../constants";
import type {
  StorageCheckTaskArguments,
  StorageVaultCheckConfig,
  StorageVaultData,
} from "../types";
import {
  useSuccessConsole,
  useWarningConsole,
  validateFullyQualifiedNames,
} from "../utils";

export const storageCheckAction: ActionType<StorageCheckTaskArguments> = async (
  { storeFile },
  { config, run, artifacts, finder }
) => {
  ({ storeFile } = await prepareTaskArguments(config.storageVault.check, {
    storeFile,
  }));

  validateTaskArguments({
    storeFile,
  });

  if (!existsSync(storeFile)) {
    throw new HardhatPluginError(
      PLUGIN_NAME,
      "\nThe store file not found!\n" +
        "Try creating a store file or running storage-lock task with `hardhat storage-lock` command before running this task.\n"
    );
  }

  await run(TASK_COMPILE);

  const storageVaultStore = useStorageVaultStore(storeFile);
  const fullyQualifiedNames = Object.keys(storageVaultStore);
  await validateFullyQualifiedNames(artifacts, fullyQualifiedNames);

  for (const fullyQualifiedName of fullyQualifiedNames) {
    const entries = Object.entries(storageVaultStore[fullyQualifiedName]);
    for (const entry of entries) {
      // @ts-ignore
      storageVaultStore[fullyQualifiedName][entry[0]] = {
        value: entry[1],
        isOk: false,
      };
    }

    const [contractPath, contractName] = fullyQualifiedName.split(":");
    await finder.setFor(contractPath, contractName, false);
    const storage = finder.getStorageLayout()!!.storage;
    if (
      !finder.getStorageLayout() &&
      Object.keys(storageVaultStore[fullyQualifiedName]).length
    ) {
      throw new HardhatPluginError(
        PLUGIN_NAME,
        "\nNo storage layout of the contract but wants it to storage store file! Try compiling with Hardhat before running this task.\n" +
          `  Contract path: ${contractPath}\n` +
          `  Contract name: ${contractName}`
      );
    }

    for (const item of storage) {
      // @ts-ignore
      const slot = storageVaultStore[fullyQualifiedName][item!!.label]?.value;
      if (undefined !== slot) {
        if (item!!.slot !== slot) {
          throw new HardhatPluginError(
            PLUGIN_NAME,
            "\nInvalid slot value!\n" +
              `  Contract path: ${contractPath}\n` +
              `  Contract name: ${contractName}\n` +
              `    Slot name: ${item!!.label}\n` +
              `    Slot (Expected): ${slot}\n` +
              `    Slot (Actual): ${item!!.slot}`
          );
        }

        // @ts-ignore
        storageVaultStore[fullyQualifiedName][item!!.label].isOk = true;
      } else {
        useWarningConsole(
          "Unexpected slot value!\n" +
            "Make sure to update your store file using the `hardhat storage-lock` command.\n" +
            `  Contract path: ${contractPath}\n` +
            `  Contract name: ${contractName}\n` +
            `    Slot name: ${item!!.label}\n` +
            `    Slot (Actual): ${item!!.slot}`
        );
      }
    }

    for (const entry of entries) {
      // @ts-ignore
      if (!storageVaultStore[fullyQualifiedName][entry[0]].isOk) {
        throw new HardhatPluginError(
          PLUGIN_NAME,
          "\nMissing slot value!\n" +
            `  Contract path: ${contractPath}\n` +
            `  Contract name: ${contractName}\n` +
            `    Slot name: ${entry[0]}\n` +
            `    Slot (Expected): ${
              // @ts-ignore
              storageVaultStore[fullyQualifiedName][entry[0]].value
            }\n` +
            "    Slot (Actual): Missing on contract"
        );
      }
    }
  }

  useSuccessConsole(
    `Storage layout of contract(s) are compatible with your ${storeFile} file.`
  );
};

const prepareTaskArguments = async (
  storageVaultCheckConfig: StorageVaultCheckConfig,
  { storeFile }: StorageCheckTaskArguments
) => {
  return {
    storeFile: storeFile || storageVaultCheckConfig.storeFile,
  };
};

const validateTaskArguments = ({ storeFile }: StorageCheckTaskArguments) => {
  const regexp = new RegExp(/^.+\.json$/, "");
  if (!regexp.test(storeFile!!)) {
    throw new HardhatPluginError(
      PLUGIN_NAME,
      `\nThe unsupported file extension for storage store path: '${storeFile}'.\n` +
        "The storage store must be a JSON file."
    );
  }
};

const useStorageVaultStore = (storeFile: string): StorageVaultData => {
  let data: StorageVaultData = {};
  try {
    data = JSON.parse(readFileSync(storeFile, { encoding: "utf-8" }));

    if (!data) {
      throw new HardhatPluginError(
        PLUGIN_NAME,
        `\nFailed to load data from JSON file: ${storeFile}.\n` +
          "Make sure the JSON file is correct."
      );
    }
  } catch (error: any) {
    throw new HardhatPluginError(
      PLUGIN_NAME,
      `\n${error?.message || String(error)}`,
      error
    );
  }

  return data;
};
