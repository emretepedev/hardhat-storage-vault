export interface StorageCheckConfig {
  configPath: string;
  noCompile: boolean;
  runOnCompile: boolean;
}

export interface StorageCheckUserConfig {
  configPath?: string;
  noCompile?: boolean;
  runOnCompile?: boolean;
}

export interface StorageCheckTaskArguments {
  contractFqns: string[];
  noCompile: boolean;
}
