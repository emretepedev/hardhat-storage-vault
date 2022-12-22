export interface StorageVaultConfig {
  check: StorageVaultCheckConfig;
  lock: StorageVaultLockConfig;
}

export interface StorageVaultCheckConfig {
  storePath: string;
  compile: boolean;
}
export interface StorageVaultLockConfig {
  excludeContracts: string[];
  storeName: string;
  prettify: boolean;
  override: boolean;
  compile: boolean;
}

export interface StorageCheckTaskArguments {
  storePath?: string;
  compile?: boolean;
}

export interface StorageLockTaskArguments {
  excludeContracts?: string[];
  storeName?: string;
  prettify?: boolean;
  override?: boolean;
  compile?: boolean;
}

// TODO: change to this structure
// {
//   [
//     {
//       "someFQN1" : [
//         {
//           "label": "owner",
//           "value": "0"
//         },
//         {
//           "label": "foo",
//           "value": "1"
//         },
//       ]
//     },
//     {
//       "someFQN2" : [
//         {
//           "label": "bar",
//           "value": "0"
//         },
//         {
//           "label": "var",
//           "value": "1"
//         },
//       ]
//     },
//   ]
// }
export interface StorageVaultData {
  [fullyQualifiedName: string]: StorageVaultDataItem;
}

export interface StorageVaultDataItem {
  [label: string]: string;
}

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};
