import deepmerge from "deepmerge";
import type { ConfigExtender } from "hardhat/types";
import { cloneDeep } from "lodash";

import {
  DEFAULT_EXCLUDE_CONTRACTS,
  DEFAULT_OVERRIDE,
  DEFAULT_PRETTIFY,
  DEFAULT_STORE_FILE,
  DEFAULT_STORE_PATH,
} from "./constants";
import type { StorageVaultConfig } from "./types";

const getDefaultConfig = (): StorageVaultConfig => ({
  check: {
    storePath: DEFAULT_STORE_PATH,
  },
  lock: {
    excludeContracts: DEFAULT_EXCLUDE_CONTRACTS,
    storeFile: DEFAULT_STORE_FILE,
    prettify: DEFAULT_PRETTIFY,
    override: DEFAULT_OVERRIDE,
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
