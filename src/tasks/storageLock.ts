import { existsSync, writeFileSync } from "fs";
import { TASK_COMPILE } from "hardhat/builtin-tasks/task-names";
import { HardhatPluginError } from "hardhat/plugins";
import type { ActionType, Artifacts } from "hardhat/types";
import { basename, normalize } from "path";

import { PLUGIN_NAME } from "../constants";
import type {
  StorageLockTaskArguments,
  StorageVaultData,
  StorageVaultLockConfig,
} from "../types";
import { useSuccessConsole, validateFullyQualifiedNames } from "../utils";

// TODO: investigate to hardhat artifact cache
export const storageLockAction: ActionType<StorageLockTaskArguments> = async (
  { excludeContracts, storeFile, prettify, override },
  { config, run, artifacts, finder }
) => {
  ({ excludeContracts, storeFile, prettify, override } =
    await prepareTaskArguments(config.storageVault.lock, {
      excludeContracts,
      storeFile,
      prettify,
      override,
    }));

  await validateTaskArguments(artifacts, {
    excludeContracts,
    storeFile,
  });

  await run(TASK_COMPILE);

  let fullyQualifiedNames: string[] = [];
  try {
    fullyQualifiedNames = await artifacts.getAllFullyQualifiedNames();
  } catch (error: any) {
    throw new HardhatPluginError(
      PLUGIN_NAME,
      `\n${error?.message || String(error)}`,
      error
    );
  }

  fullyQualifiedNames = fullyQualifiedNames.filter(
    (item) => !excludeContracts!!.includes(item)
  );

  const data: StorageVaultData = {};
  for (const fullyQualifiedName of fullyQualifiedNames) {
    const [contractPath, contractName] = fullyQualifiedName.split(":");
    await finder.setFor(contractPath, contractName);
    const storage = finder.getStorageLayout()!!.storage;
    data[fullyQualifiedName] = {};

    for (const item of storage) {
      data[fullyQualifiedName][item!!.label] = item!!.slot;
    }
  }

  if (override || !existsSync(storeFile)) {
    try {
      writeFileSync(
        storeFile,
        JSON.stringify(data, null, prettify ? "\t" : "")
      );
    } catch (error: any) {
      throw new HardhatPluginError(
        PLUGIN_NAME,
        `\n${error?.message || String(error)}`,
        error
      );
    }
  } else {
    throw new HardhatPluginError(
      PLUGIN_NAME,
      `\nThere is already a file with this name: '${storeFile}'.\n` +
        "Run this task with --override or choose a different store file name."
    );
  }

  useSuccessConsole(`Create ${config.storageVault.lock.storeFile} file.`);
};

const prepareTaskArguments = async (
  storageVaultLockConfig: StorageVaultLockConfig,
  { excludeContracts, storeFile, prettify, override }: StorageLockTaskArguments
) => {
  return {
    excludeContracts:
      excludeContracts || storageVaultLockConfig.excludeContracts,
    storeFile: basename(
      normalize(storeFile || storageVaultLockConfig.storeFile)
    ),
    prettify: prettify || storageVaultLockConfig.prettify,
    override: override || storageVaultLockConfig.override,
  };
};

const validateTaskArguments = async (
  artifacts: Artifacts,
  { excludeContracts, storeFile }: StorageLockTaskArguments
) => {
  await validateFullyQualifiedNames(artifacts, excludeContracts!!);
  const regexp = new RegExp(/^.+\.json$/, "");
  if (!regexp.test(storeFile!!)) {
    throw new HardhatPluginError(
      PLUGIN_NAME,
      `\nThe unsupported file extension for storage store file: '${storeFile}'.\n` +
        "The storage store must be a JSON file."
    );
  }
};
