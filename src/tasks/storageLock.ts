import { existsSync, writeFileSync } from "fs";
import { TASK_COMPILE } from "hardhat/builtin-tasks/task-names";
import type { ActionType, Artifacts } from "hardhat/types";
import { basename, normalize } from "path";

import type {
  StorageLockTaskArguments,
  StorageVaultConfig,
  StorageVaultData,
} from "../types";
import {
  useHardhatPluginError,
  useSuccessConsole,
  useWarningConsole,
  validateFullyQualifiedNames,
} from "../utils";

export const storageLockAction: ActionType<StorageLockTaskArguments> = async (
  { excludeContracts, storeName, prettify, override, compile },
  { config, run, artifacts, finder }
) => {
  ({ excludeContracts, storeName, prettify, override, compile } =
    await prepareTaskArguments(config.storageVault, {
      excludeContracts,
      storeName,
      prettify,
      override,
      compile,
    }));

  await validateTaskArguments(artifacts, {
    excludeContracts,
    storeName,
  });

  if (compile) {
    await run(TASK_COMPILE, { quiet: true });
  } else {
    useWarningConsole(
      "If artifacts are not found try adding --compile flag or compiling with Hardhat before running this task."
    );
  }

  let fullyQualifiedNames: string[] = [];
  try {
    fullyQualifiedNames = await artifacts.getAllFullyQualifiedNames();
  } catch (error: any) {
    useHardhatPluginError(error, true);
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

  if (override || !existsSync(storeName)) {
    try {
      writeFileSync(
        storeName,
        JSON.stringify(data, null, prettify ? "\t" : "")
      );
    } catch (error: any) {
      useHardhatPluginError(error, true);
    }
  } else {
    useHardhatPluginError(
      `There is already a file with this name: '${storeName}'.\n` +
        "Run this task with --override or choose a different store name."
    );
  }

  useSuccessConsole(`Create ${config.storageVault.lock.storeName} file.`);
};

const prepareTaskArguments = async (
  storageVaultConfig: StorageVaultConfig,
  {
    excludeContracts,
    storeName,
    prettify,
    override,
    compile,
  }: Partial<StorageLockTaskArguments>
) => {
  return {
    excludeContracts: (excludeContracts ||=
      storageVaultConfig.lock.excludeContracts),
    storeName: basename(
      normalize((storeName ||= storageVaultConfig.lock.storeName))
    ),
    prettify: (prettify ||= storageVaultConfig.lock.prettify),
    override: (override ||= storageVaultConfig.lock.override),
    compile: (compile ||= storageVaultConfig.lock.compile),
  };
};

const validateTaskArguments = async (
  artifacts: Artifacts,
  { excludeContracts, storeName }: Partial<StorageLockTaskArguments>
) => {
  await validateFullyQualifiedNames(artifacts, excludeContracts!!);
  const regexp = new RegExp(/^.+\.json$/, "");
  if (!regexp.test(storeName!!)) {
    useHardhatPluginError(
      `The unsupported file extension for storage store path: '${storeName}'.\n` +
        `The storage store must be a JSON file.`
    );
  }
};
