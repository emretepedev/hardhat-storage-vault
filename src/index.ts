import "hardhat-finder";
import { extendConfig } from "hardhat/config";
import { storageVaultConfigExtender } from "~/config";
import "~/tasks";
import "~/type-extensions";

extendConfig(storageVaultConfigExtender);
