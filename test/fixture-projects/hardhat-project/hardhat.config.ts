// tslint:disable no-implicit-dependencies
import "hardhat-finder";
import type { HardhatUserConfig } from "hardhat/types";
// tslint:enable no-implicit-dependencies
import "~/index";

const config: HardhatUserConfig = {
  solidity: "0.8.0",
  defaultNetwork: "hardhat",
  storageVault: {
    check: {
      storeFile: "storage-store.json",
    },
  },
};

export default config;
