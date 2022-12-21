import { TASK_COMPILE } from "hardhat/builtin-tasks/task-names";
import { extendConfig, extendEnvironment, task, types } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { storageCheckConfigExtender } from "./config";
import { TASK_STORAGE_CHECK } from "./constants";
import { StorageCheck } from "./StorageCheck";
import { storageCheckCompileAction } from "./tasks/compile";
import { storageCheckAction } from "./tasks/storageCheck";
import "./type-extensions";

extendConfig(storageCheckConfigExtender);

extendEnvironment((hre: HardhatRuntimeEnvironment) => {
  hre.storageCheck = lazyObject(() => new StorageCheck(hre));
});

task(TASK_STORAGE_CHECK)
  .addOptionalVariadicPositionalParam(
    "contractFqns",
    "Fully Qualified Names of the contract files.",
    undefined,
    types.string
  )
  .addFlag("noCompile", "Don't compile before running this task.")
  .setDescription("Check the storage layout of any/all existing contracts.")
  .setAction(storageCheckAction);

task(TASK_COMPILE)
  .addFlag(
    "noStorageCheck",
    "Don't run Storage Check after running this task, even if storageCheck.runOnCompile option is true"
  )
  .setAction(storageCheckCompileAction);
