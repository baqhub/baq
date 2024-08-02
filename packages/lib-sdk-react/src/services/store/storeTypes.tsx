import {AnyRecord, NoContentRecord, StandingRecord} from "@baqhub/sdk";

export type UpdateRecords<T extends AnyRecord> = (
  updates: ReadonlyArray<T | StandingRecord | NoContentRecord>,
  proxyEntity?: string
) => void;
