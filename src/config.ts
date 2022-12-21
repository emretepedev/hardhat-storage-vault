import type { ConfigExtender } from "hardhat/types";
import { cloneDeep } from "lodash";
import {
  DEFAULT_CONFIG_PATH,
  DEFAULT_NO_COMPILE,
  DEFAULT_RUN_ON_COMPILE,
} from "./constants";
import type { StorageCheckConfig } from "./types";

const getDefaultConfig = () => ({
  configPath: DEFAULT_CONFIG_PATH,
  noCompile: DEFAULT_NO_COMPILE,
  runOnCompile: DEFAULT_RUN_ON_COMPILE,
});

export const storageCheckConfigExtender: ConfigExtender = (
  config,
  userConfig
) => {
  const defaultConfig = getDefaultConfig();

  if (userConfig.storageCheck !== undefined) {
    const customConfig = cloneDeep(userConfig.storageCheck);

    config.storageCheck = {
      ...defaultConfig,
      ...customConfig,
    };
  } else {
    config.storageCheck = defaultConfig as StorageCheckConfig;
  }
};
