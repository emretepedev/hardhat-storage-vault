import { readFileSync } from "fs";
import { TASK_COMPILE } from "hardhat/builtin-tasks/task-names";
import type { ActionType } from "hardhat/types";

import type {
  StorageCheckTaskArguments,
  StorageVaultConfig,
  StorageVaultData,
} from "../types";
import {
  useHardhatPluginError,
  useSuccessConsole,
  useWarningConsole,
  validateFullyQualifiedNames,
} from "../utils";

export const storageCheckAction: ActionType<StorageCheckTaskArguments> = async (
  { storePath, compile },
  { config, run, artifacts, finder }
) => {
  ({ storePath, compile } = await prepareTaskArguments(config.storageVault, {
    storePath,
    compile,
  }));

  validateTaskArguments({
    storePath,
  });

  if (compile) {
    await run(TASK_COMPILE, { quiet: true });
  } else {
    useWarningConsole(
      "If artifacts are not found try adding --compile flag or compiling with Hardhat before running this task."
    );
  }

  const storageVaultData = useStorageVaultStore(storePath);
  const fullyQualifiedNames = Object.keys(storageVaultData!!);
  await validateFullyQualifiedNames(artifacts, fullyQualifiedNames);

  for (const fullyQualifiedName of fullyQualifiedNames) {
    const entries = Object.entries(storageVaultData[fullyQualifiedName]);
    for (const entry of entries) {
      // @ts-ignore
      storageVaultData[fullyQualifiedName][entry[0]] = {
        value: entry[1],
        isOk: false,
      };
    }

    const [contractPath, contractName] = fullyQualifiedName.split(":");
    await finder.setFor(contractPath, contractName);
    const storage = finder.getStorageLayout()!!.storage;
    if (
      !finder.getStorageLayout() &&
      Object.keys(storageVaultData[fullyQualifiedName]).length
    ) {
      useHardhatPluginError(
        `No storage layout of the contract but wants it to storage store file! Try adding --compile flag or compiling with Hardhat before running this task.\n` +
          `  Contract path: ${contractPath}\n` +
          `  Contract name: ${contractName}`
      );
    }

    for (const item of storage) {
      // @ts-ignore
      const slot = storageVaultData[fullyQualifiedName][item!!.label].value;
      if (undefined !== slot) {
        if (item!!.slot !== slot) {
          useHardhatPluginError(
            `Invalid slot value!\n` +
              `  Contract path: ${contractPath}\n` +
              `  Contract name: ${contractName}\n` +
              `    Slot name: ${item!!.label}\n` +
              `    Slot (Expected): ${slot}\n` +
              `    Slot (Actual): ${item!!.slot}`
          );
        }

        // @ts-ignore
        storageVaultData[fullyQualifiedName][item!!.label].isOk = true;
      }
    }

    for (const entry of entries) {
      // @ts-ignore
      if (!storageVaultData[fullyQualifiedName][entry[0]].isOk) {
        useHardhatPluginError(
          `Missing slot value!\n` +
            `  Contract path: ${contractPath}\n` +
            `  Contract name: ${contractName}\n` +
            `    Slot name: ${entry[0]}\n` +
            `    Slot (Expected): ${
              // @ts-ignore
              storageVaultData[fullyQualifiedName][entry[0]].value
            }\n` +
            `    Slot (Actual): Missing on contract`
        );
      }
    }
  }

  useSuccessConsole(
    `Storage layout of contract(s) are compatible with your ${config.storageVault.check.storePath} file.`
  );
};

const prepareTaskArguments = async (
  storageVaultConfig: StorageVaultConfig,
  { storePath, compile }: Partial<StorageCheckTaskArguments>
) => {
  return {
    storePath: (storePath ||= storageVaultConfig.check.storePath),
    compile: (compile ||= storageVaultConfig.check.compile),
  };
};

const validateTaskArguments = ({
  storePath,
}: Partial<StorageCheckTaskArguments>) => {
  const regexp = new RegExp(/^.+\.json$/, "");
  if (!regexp.test(storePath!!)) {
    useHardhatPluginError(
      `The unsupported file extension for storage store path: '${storePath}'.\n` +
        "The storage store must be a JSON file."
    );
  }
};

const useStorageVaultStore = (storePath: string): StorageVaultData => {
  let data: StorageVaultData = {};
  try {
    data = JSON.parse(readFileSync(storePath, { encoding: "utf-8" }));
    if (!data) {
      throw new Error(
        `Failed to load data from JSON file: ${storePath}.\n` +
          "Make sure the JSON file is correct."
      );
    }
  } catch (error: any) {
    useHardhatPluginError(error, true);
  }

  return data;
};
