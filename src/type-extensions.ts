import "hardhat/types/config";
import "hardhat/types/runtime";

import type { RecursivePartial, StorageVaultConfig } from "./types";

declare module "hardhat/types/config" {
  export interface HardhatUserConfig {
    storageVault: RecursivePartial<StorageVaultConfig>;
  }
  export interface HardhatConfig {
    storageVault: StorageVaultConfig;
  }
}
