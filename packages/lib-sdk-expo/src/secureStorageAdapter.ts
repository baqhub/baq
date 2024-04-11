import {SecureStorageAdapter, StorageAdapterType} from "@baqhub/sdk-react";
import * as SecureStore from "expo-secure-store";
import {SecureStoreOptions} from "expo-secure-store";

const options: SecureStoreOptions = {
  requireAuthentication: false,
  keychainAccessible: SecureStore.ALWAYS,
  keychainService: "com.baqhub.sdk.expo",
};

export const secureStorageAdapter: SecureStorageAdapter = {
  type: StorageAdapterType.SECURE,
  async getString(key) {
    return (await SecureStore.getItemAsync(key, options)) || undefined;
  },
  setString(key, value) {
    return SecureStore.setItemAsync(key, value, options);
  },
  removeString(key) {
    return SecureStore.deleteItemAsync(key, options);
  },
};
