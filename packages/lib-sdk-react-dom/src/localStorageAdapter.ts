import {StorageAdapter, StorageAdapterType} from "@baqhub/sdk-react";

export const localStorageAdapter: StorageAdapter = {
  type: StorageAdapterType.STANDARD,
  getString(key) {
    return Promise.resolve(localStorage.getItem(key) || undefined);
  },
  async setString(key, value) {
    localStorage.setItem(key, value);
  },
  async removeString(key) {
    localStorage.removeItem(key);
  },
};
