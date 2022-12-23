// tslint:disable no-implicit-dependencies
import "hardhat-finder";
import type { HardhatUserConfig } from "hardhat/types";
// tslint:enable no-implicit-dependencies

import "../../../src/index";

const config: HardhatUserConfig = {
  solidity: "0.8.0",
  defaultNetwork: "hardhat",
  storageVault: {
    check: {
      storePath: "storage-store.json",
    },
  },
};

export default config;
