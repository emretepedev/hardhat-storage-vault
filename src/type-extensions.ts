import "hardhat/types/config";
import "hardhat/types/runtime";
import type { StorageVaultConfig, StorageVaultUserConfig } from "~/types";

declare module "hardhat/types/config" {
  export interface HardhatUserConfig {
    storageVault: StorageVaultUserConfig;
  }
  export interface HardhatConfig {
    storageVault: StorageVaultConfig;
  }
}
