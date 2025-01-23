interface BlobObject {
  key: string;
  size: number;
  body: ReadableStream;
}

export interface BlobStoreAdapter {
  get: (key: string) => Promise<BlobObject | undefined>;
  set: (key: string, stream: ReadableStream) => Promise<BlobObject>;
  delete: (key: string) => Promise<void>;
}
