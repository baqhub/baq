import {AnyRecord} from "@baqhub/sdk";
import {createContext, useContext} from "react";
import {StoreContextProps} from "./storeContext.js";
import {
  findEntityRecord,
  findRecordByKey,
  findRecordByQuery,
  findStandingDecision,
  recordByKey,
  recordByVersion,
  updateStandingDecision,
} from "./storeHelpers.js";

//
// Helpers.
//

export function buildAccessors(entity: string, proxyEntity: string) {
  return {
    recordByKey: recordByKey(entity, proxyEntity),
    findRecordByKey: findRecordByKey(entity, proxyEntity),
    findRecordByQuery: findRecordByQuery(entity, proxyEntity),
    findEntityRecord: findEntityRecord(entity, proxyEntity),
    findStandingDecision: findStandingDecision(entity),
  };
}

export function buildHelpers<T extends AnyRecord>(
  store: StoreContextProps<T>,
  accessors: ReturnType<typeof buildAccessors>,
  proxyEntity: string
) {
  const {entity, client, versions, getStateSnapshot} = store;
  const {updateRecords, uploadBlob, buildBlobUrl, onDisconnectRequest} = store;
  const updateStanding = updateStandingDecision<T>(entity);

  return {
    entity,
    proxyEntity,
    client,
    recordByVersion: recordByVersion(versions),
    recordByKey: accessors.recordByKey(getStateSnapshot),
    findRecordByKey: accessors.findRecordByKey(getStateSnapshot),
    findRecordByQuery: accessors.findRecordByQuery(getStateSnapshot),
    findEntityRecord: accessors.findEntityRecord(getStateSnapshot),
    findStandingDecision: accessors.findStandingDecision(getStateSnapshot),
    updateStandingDecision: updateStanding(getStateSnapshot, updateRecords),
    updateRecords,
    uploadBlob,
    buildBlobUrl,
    onDisconnectRequest,
  };
}

//
// Context.
//

export interface ProxyStoreContextProps<T extends AnyRecord> {
  proxyEntity: string;
  accessors: ReturnType<typeof buildAccessors>;
  helpers: ReturnType<typeof buildHelpers<T>>;
}

export function buildProxyStoreContext<T extends AnyRecord>() {
  const ProxyStoreContext = createContext<
    ProxyStoreContextProps<T> | undefined
  >(undefined);

  function useProxyStoreContext() {
    const context = useContext(ProxyStoreContext);
    if (!context) {
      throw new Error("Store entity provider is required.");
    }

    return context;
  }

  return {
    ProxyStoreContext,
    useProxyStoreContext,
  };
}
