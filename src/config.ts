import deepmerge from "deepmerge";
import type { ConfigExtender } from "hardhat/types";
import { cloneDeep } from "lodash";

import {
  DEFAULT_EXCLUDE_CONTRACTS,
  DEFAULT_OVERWRITE,
  DEFAULT_PRETTIFY,
  DEFAULT_STORE_FILE,
} from "./constants";
import type { StorageVaultConfig } from "./types";

const getDefaultConfig = (): StorageVaultConfig => ({
  check: {
    storeFile: DEFAULT_STORE_FILE,
  },
  lock: {
    excludeContracts: DEFAULT_EXCLUDE_CONTRACTS,
    storeFile: DEFAULT_STORE_FILE,
    prettify: DEFAULT_PRETTIFY,
    overwrite: DEFAULT_OVERWRITE,
  },
});

export const storageVaultConfigExtender: ConfigExtender = (
  config,
  userConfig
) => {
  const defaultConfig = getDefaultConfig();
  if (userConfig.storageVault !== undefined) {
    const customConfig = cloneDeep(userConfig.storageVault);

    config.storageVault = deepmerge(
      defaultConfig,
      customConfig
    ) as StorageVaultConfig;
  } else {
    config.storageVault = defaultConfig;
  }
};
