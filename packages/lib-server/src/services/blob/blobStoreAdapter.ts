interface BlobObject {
  key: string;
  size: number;
}

interface BlobObjectBody extends BlobObject {
  key: string;
  size: number;
  body: ReadableStream;
}

export interface BlobStoreAdapter {
  get: (key: string) => Promise<BlobObjectBody | undefined>;
  set: (key: string, stream: ReadableStream) => Promise<BlobObject>;
  delete: (key: string) => Promise<void>;
}
