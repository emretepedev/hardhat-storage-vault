import chalk from "chalk";
import { HardhatPluginError } from "hardhat/plugins";
import type { Artifacts } from "hardhat/types";

import { PLUGIN_NAME } from "./constants";

export const validateFullyQualifiedNames = async (
  artifacts: Artifacts,
  fullyQualifiedNames: string[]
) => {
  try {
    for (const fullyQualifiedName of fullyQualifiedNames) {
      const artifactExist = await artifacts.artifactExists(fullyQualifiedName);
      if (!artifactExist) {
        throw new Error(
          "Artifact not found. Try adding --compile flag or compiling with Hardhat before running this task"
        );
      }
    }
  } catch (error: any) {
    throw new HardhatPluginError(
      PLUGIN_NAME,
      `\n${error?.message || String(error)}`,
      error
    );
  }
};

export const useWarningConsole = (message: string) => {
  console.log(chalk.yellow(`Warning in plugin ${PLUGIN_NAME}:\n` + message));
};

export const useSuccessConsole = (message: string) => {
  console.log(chalk.green(`Success in plugin ${PLUGIN_NAME}:\n` + message));
};
