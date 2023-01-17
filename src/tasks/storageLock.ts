import { existsSync, writeFileSync } from "fs";
import { TASK_COMPILE } from "hardhat/builtin-tasks/task-names";
import { task, types } from "hardhat/config";
import { HardhatPluginError } from "hardhat/plugins";
import type { ActionType } from "hardhat/types";
import { basename, normalize } from "path";
import { PLUGIN_NAME, TASK_STORAGE_LOCK } from "~/constants";
import type {
  StorageLockTaskArguments,
  StorageVaultData,
  StorageVaultLockConfig,
} from "~/types";
import { useSuccessConsole } from "~/utils";

// TODO: investigate to hardhat artifact cache
// TODO: change file name to storage-lock (check other repos!)
const storageLockAction: ActionType<StorageLockTaskArguments> = async (
  { excludeContracts, storeFile, prettify, overwrite },
  { config, run, artifacts, finder }
) => {
  ({ excludeContracts, storeFile, prettify, overwrite } = prepareTaskArguments(
    config.storageVault.lock,
    {
      excludeContracts,
      storeFile,
      prettify,
      overwrite,
    }
  ));

  validateTaskArguments({
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

  fullyQualifiedNames = fullyQualifiedNames.filter((item) => {
    for (const excludeContract of excludeContracts!!) {
      const isMatch = new RegExp(excludeContract, "g").test(item);

      if (isMatch) {
        return false;
      }
    }

    return true;
  });

  const data: StorageVaultData = {};
  for (const fullyQualifiedName of fullyQualifiedNames) {
    const [contractPath, contractName] = fullyQualifiedName.split(":");
    await finder.setFor(contractPath, contractName, false);
    const storage = finder.getStorageLayout()!!.storage;
    data[fullyQualifiedName] = {};

    for (const item of storage) {
      data[fullyQualifiedName][item!!.label] = item!!.slot;
    }
  }

  if (overwrite || !existsSync(storeFile)) {
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
      `\nThere is a file with this name: '${storeFile}'.\n` +
        "Run this task with --overwrite or choose a different store file name."
    );
  }

  useSuccessConsole(`Created ${storeFile} file.`);
};

const prepareTaskArguments = (
  storageVaultLockConfig: StorageVaultLockConfig,
  { excludeContracts, storeFile, prettify, overwrite }: StorageLockTaskArguments
) => {
  return {
    excludeContracts:
      excludeContracts || storageVaultLockConfig.excludeContracts,
    storeFile: basename(
      normalize(storeFile || storageVaultLockConfig.storeFile)
    ),
    prettify: prettify || storageVaultLockConfig.prettify,
    overwrite: overwrite || storageVaultLockConfig.overwrite,
  };
};

const validateTaskArguments = ({ storeFile }: StorageLockTaskArguments) => {
  const regexp = new RegExp(/^.+\.json$/, "");
  if (!regexp.test(storeFile!!)) {
    throw new HardhatPluginError(
      PLUGIN_NAME,
      `\nThe unsupported file extension for storage store file: '${storeFile}'.\n` +
        "The storage store must be a JSON file."
    );
  }
};

task<StorageLockTaskArguments>(TASK_STORAGE_LOCK)
  .addOptionalVariadicPositionalParam(
    "excludeContracts",
    "Regex string to ignore contracts.",
    undefined,
    types.string
  )
  .addOptionalParam(
    "storeFile",
    "Create or update a specific JSON file to save the storage store.",
    undefined,
    types.string
  )
  .addFlag("prettify", "Save the file by formatting.")
  .addFlag(
    "overwrite",
    "Overwrite if there is a store file with the same name."
  )
  .setDescription("Create or update the new storage store of contracts.")
  .setAction(storageLockAction);
