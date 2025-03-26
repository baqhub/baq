export type KvKey<T> = ReadonlyArray<string> & {_t?: T};

export interface KvStoreAdapter {
  get: <T>(key: KvKey<T>) => Promise<T | undefined>;
  set: <T>(key: KvKey<T>, value: T) => Promise<void>;
  delete: (key: KvKey<any>) => Promise<void>;
}
