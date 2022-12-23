import { readFileSync } from "fs";
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
  { storePath, compile },
  { config, run, artifacts, finder }
) => {
  ({ storePath, compile } = await prepareTaskArguments(
    config.storageVault.check,
    {
      storePath,
      compile,
    }
  ));

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
      throw new HardhatPluginError(
        PLUGIN_NAME,
        "\nNo storage layout of the contract but wants it to storage store file! Try adding --compile flag or compiling with Hardhat before running this task.\n" +
          `  Contract path: ${contractPath}\n` +
          `  Contract name: ${contractName}`
      );
    }

    for (const item of storage) {
      // @ts-ignore
      const slot = storageVaultData[fullyQualifiedName][item!!.label].value;
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
        storageVaultData[fullyQualifiedName][item!!.label].isOk = true;
      }
    }

    for (const entry of entries) {
      // @ts-ignore
      if (!storageVaultData[fullyQualifiedName][entry[0]].isOk) {
        throw new HardhatPluginError(
          PLUGIN_NAME,
          "\nMissing slot value!\n" +
            `  Contract path: ${contractPath}\n` +
            `  Contract name: ${contractName}\n` +
            `    Slot name: ${entry[0]}\n` +
            `    Slot (Expected): ${
              // @ts-ignore
              storageVaultData[fullyQualifiedName][entry[0]].value
            }\n` +
            "    Slot (Actual): Missing on contract"
        );
      }
    }
  }

  useSuccessConsole(
    `Storage layout of contract(s) are compatible with your ${config.storageVault.check.storePath} file.`
  );
};

const prepareTaskArguments = async (
  storageVaultCheckConfig: StorageVaultCheckConfig,
  { storePath, compile }: StorageCheckTaskArguments
) => {
  return {
    storePath: storePath || storageVaultCheckConfig.storePath,
    compile: compile || storageVaultCheckConfig.compile,
  };
};

const validateTaskArguments = ({ storePath }: StorageCheckTaskArguments) => {
  const regexp = new RegExp(/^.+\.json$/, "");
  if (!regexp.test(storePath!!)) {
    throw new HardhatPluginError(
      PLUGIN_NAME,
      `\nThe unsupported file extension for storage store path: '${storePath}'.\n` +
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
    throw new HardhatPluginError(
      PLUGIN_NAME,
      `\n${error?.message || String(error)}`,
      error
    );
  }

  return data;
};
