import "hardhat/types/config";
import "hardhat/types/runtime";
import type { StorageCheck } from "./StorageCheck";
import type { StorageCheckConfig } from "./types";

declare module "hardhat/types/config" {
  export interface HardhatUserConfig {
    storageCheck: Partial<StorageCheckConfig>;
  }
  export interface HardhatConfig {
    storageCheck: StorageCheckConfig;
  }
}

declare module "hardhat/types/runtime" {
  export interface HardhatRuntimeEnvironment {
    storageCheck: StorageCheck;
  }
}
