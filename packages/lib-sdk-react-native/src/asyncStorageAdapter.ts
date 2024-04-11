import {fixImport} from "@baqhub/sdk";
import {StorageAdapter, StorageAdapterType} from "@baqhub/sdk-react";
import AsyncStorageBase from "@react-native-async-storage/async-storage";

const AsyncStorage = fixImport(AsyncStorageBase);

export const asyncStorageAdapter: StorageAdapter = {
  type: StorageAdapterType.STANDARD,
  async getString(key) {
    return (await AsyncStorage.getItem(key)) || undefined;
  },
  setString(key, value) {
    return AsyncStorage.setItem(key, value);
  },
  removeString(key) {
    return AsyncStorage.removeItem(key);
  },
};
