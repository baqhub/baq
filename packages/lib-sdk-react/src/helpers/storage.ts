import {
  AuthenticationState,
  IO,
  RAuthenticationState,
  isDefined,
} from "@baqhub/sdk";

//
// Underlying provider.
//

interface BaseStorageAdapter {
  getString: (key: string) => Promise<string | undefined>;
  setString: (key: string, value: string) => Promise<void>;
  removeString: (key: string) => Promise<void>;
}

export enum StorageAdapterType {
  STANDARD = "standard",
  SECURE = "secure",
}

export interface StorageAdapter extends BaseStorageAdapter {
  type: StorageAdapterType.STANDARD;
}

export interface SecureStorageAdapter extends BaseStorageAdapter {
  type: StorageAdapterType.SECURE;
}

//
// API.
//

export const Storage = {
  async read<T extends IO.Any>(
    provider: BaseStorageAdapter,
    model: T,
    key: string
  ) {
    try {
      const stringValue = await provider.getString(key);
      if (!stringValue) {
        return undefined;
      }

      const jsonValue = JSON.parse(stringValue);
      return IO.decode(model, jsonValue);
    } catch (err) {
      console.log("Error while reading storage value:", key, err);
      return undefined;
    }
  },

  write<T extends IO.Any>(
    provider: BaseStorageAdapter,
    model: T,
    key: string,
    value: IO.TypeOf<T>
  ) {
    const jsonValue = model.encode(value);
    const stringValue = JSON.stringify(jsonValue);
    return provider.setString(key, stringValue);
  },
};

//
// Authentication state API.
//

const stateKey = "auth_state";
const stateSecretKey = "auth_state_secret";

export class AuthenticationStorage {
  constructor(
    private adapter: StorageAdapter,
    private secureAdapter?: SecureStorageAdapter
  ) {}

  async read(): Promise<AuthenticationState | undefined> {
    const authenticationStatePromise = Storage.read(
      this.adapter,
      RAuthenticationState,
      stateKey
    );

    if (!this.secureAdapter) {
      return authenticationStatePromise;
    }

    // If secure storage is available, read the private key separately.
    const [authenticationState, authenticationSecret] = await Promise.all([
      authenticationStatePromise,
      Storage.read(this.secureAdapter, IO.base64Bytes, stateSecretKey),
    ]);

    if (!authenticationState || !authenticationSecret) {
      return undefined;
    }

    return {
      ...authenticationState,
      credentialsRecord: {
        ...authenticationState.credentialsRecord,
        content: {
          ...authenticationState.credentialsRecord.content,
          privateKey: authenticationSecret,
        },
      },
    };
  }

  async write(state: AuthenticationState | undefined) {
    // If no state was provided, clear the storage.
    if (!state) {
      return Promise.all(
        [
          this.adapter.removeString(stateKey),
          this.secureAdapter?.removeString(stateSecretKey),
        ].filter(isDefined)
      );
    }

    if (!this.secureAdapter) {
      return Storage.write(this.adapter, RAuthenticationState, stateKey, state);
    }

    // If secure storage is available, store the private key separately.
    const authenticationState: AuthenticationState = {
      ...state,
      credentialsRecord: {
        ...state.credentialsRecord,
        content: {
          ...state.credentialsRecord.content,
          privateKey: new Uint8Array(0),
        },
      },
    };
    const authenticationSecret = state.credentialsRecord.content.privateKey;

    return Promise.all([
      Storage.write(
        this.adapter,
        RAuthenticationState,
        stateKey,
        authenticationState
      ),
      Storage.write(
        this.secureAdapter,
        IO.base64Bytes,
        stateSecretKey,
        authenticationSecret
      ),
    ]);
  }
}
