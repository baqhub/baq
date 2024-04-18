import {
  AnyRecord,
  Client,
  Http,
  HttpStatusCode,
  IO,
  NoContentRecord,
  RAnyEventRecord,
  RAnyRecord,
  Record,
  RecordMode,
  RecordVersion,
  never,
} from "@baqhub/sdk";
import {Records} from "./storeContext.js";

export interface Mutation<T extends AnyRecord> {
  state: Records<T>;
  record: T | NoContentRecord;
  followingUpdates: ReadonlyArray<T | NoContentRecord>;
}

export interface ApplyUpdatesResult<T extends AnyRecord> {
  state: Records<T>;
  mutations: ReadonlyArray<Mutation<T>>;
}

export function applyUpdates<T extends AnyRecord>(
  initialState: Records<T>,
  initialMutations: ReadonlyArray<Mutation<T>>,
  updates: ReadonlyArray<T | NoContentRecord>
): ApplyUpdatesResult<T> {
  return updates.reduce(
    (result, update) => {
      const {state, mutations} = result;
      const key = Record.toKey(update);
      const existing = state[key as any];
      const existingVCA = existing?.version?.createdAt || new Date(0);
      const versionCreatedAt = update.version?.createdAt || new Date(0);

      if (update.source === "proxy") {
        throw new Error("Unexpected proxy record");
      }

      if (existingVCA > versionCreatedAt) {
        return result;
      }

      const newState = {...state, [key]: update};

      if (update.mode === RecordMode.SYNCED && !update.version?.hash) {
        const mutation: Mutation<T> = {
          state,
          record: update,
          followingUpdates: [],
        };

        return {
          state: newState,
          mutations: [...mutations, mutation],
        };
      }

      const lastMutation = mutations[mutations.length - 1];
      if (!lastMutation) {
        return {
          state: newState,
          mutations,
        };
      }

      return {
        state: newState,
        mutations: [
          ...mutations.slice(0, -1),
          {
            ...lastMutation,
            followingUpdates: [...lastMutation.followingUpdates, update],
          },
        ],
      };
    },
    {
      state: initialState,
      mutations: initialMutations,
    } as ApplyUpdatesResult<T>
  );
}

export function applyProxyUpdates<T extends AnyRecord>(
  initialState: Records<T>,
  initialMutations: ReadonlyArray<Mutation<T>>,
  updates: ReadonlyArray<T | NoContentRecord>
): ApplyUpdatesResult<T> {
  return updates.reduce(
    (result, update) => {
      const {state, mutations} = result;
      const key = Record.toKey(update);
      const existing = state[key as any];
      const existingVCA = existing?.version?.createdAt || new Date(0);
      const versionCreatedAt = update.version?.createdAt || new Date(0);

      if (existingVCA > versionCreatedAt) {
        return result;
      }

      const newState = {...state, [key]: update};
      return {
        state: newState,
        mutations,
      };
    },
    {
      state: initialState,
      mutations: initialMutations,
    } as ApplyUpdatesResult<T>
  );
}

export async function performMutationRequest<
  K extends RAnyRecord,
  KE extends RAnyEventRecord,
>(
  model: K,
  eventModel: KE,
  entity: string,
  client: Client,
  mutation: Mutation<IO.TypeOf<K>>,
  signal: AbortSignal
) {
  type T = IO.TypeOf<K>;

  const performRequest = async (
    {state, record, followingUpdates}: Mutation<T>,
    attempt: number
  ): Promise<ApplyUpdatesResult<T>> => {
    const key = Record.toKey(record);
    const existing = state[key as any];

    const newRecord = ((): T | NoContentRecord => {
      // Create record.
      if (
        (!existing || existing.mode !== RecordMode.SYNCED) &&
        "content" in record
      ) {
        return record;
      }

      // Update / Delete.
      if (!existing || !existing.version) {
        throw new Error("Unexpected record update.");
      }

      const versionCreatedAt = existing.version.createdAt;
      if (record.version && record.version.createdAt <= versionCreatedAt) {
        throw new Error("CreatedAt needs to be more recent.");
      }

      // Make sure the new date is higher.
      // TODO: bound this and keep local server offset.
      const now = new Date();
      const newVersionCreatedAt =
        versionCreatedAt > now ? new Date(versionCreatedAt.getTime() + 1) : now;

      // Update record or delete record.
      const newVersion: RecordVersion<any> = {
        author: {entity},
        hash: undefined,
        createdAt: newVersionCreatedAt,
        receivedAt: undefined,
        ...record.version,
        parentHash: existing.version.hash,
      };

      return {
        ...record,
        version: newVersion,
      };
    })();

    try {
      const {record, linkedRecords} = await (() => {
        // Create record.
        if ("content" in newRecord && !newRecord.version?.parentHash) {
          return client.postRecord(model, model, newRecord, signal);
        }

        // Update record.
        if ("content" in newRecord) {
          return client.putRecord(model, model, newRecord, signal);
        }

        // Delete record
        return client.deleteRecord(model, newRecord, signal);
      })();

      return applyUpdates(
        state,
        [],
        [record, ...linkedRecords, ...followingUpdates]
      );
    } catch (err) {
      // Permanent error OR Conflict on create: revert.
      if (
        Http.isError(err, [
          HttpStatusCode.BAD_REQUEST,
          HttpStatusCode.NOT_FOUND,
        ]) ||
        ((!newRecord.version?.parentHash || attempt > 3) &&
          Http.isError(err, [HttpStatusCode.CONFLICT]))
      ) {
        return applyUpdates(state, [], followingUpdates);
      }

      // Conflict on update, fetch latest version and resolve.
      if (Http.isError(err, [HttpStatusCode.CONFLICT])) {
        return fetchLatestAndUpdate(mutation, newRecord, attempt);
      }

      throw err;
    }
  };

  const fetchLatestAndUpdate = async (
    {state, record, followingUpdates}: Mutation<T>,
    newRecord: T | NoContentRecord,
    attempt: number
  ) => {
    try {
      const {record: latest, linkedRecords} = await client.getRecord(
        model,
        eventModel,
        record.author.entity,
        record.id,
        {
          query: {includeDeleted: true},
          signal,
        }
      );

      if (!latest.version || !newRecord.version) {
        never();
      }

      // We may want to use the latest version instead of updating.
      // TODO:
      // - Improve same record detection logic.
      // - Compare content while ignoring missing undefined properties.
      if (
        // Updated record.
        latest.version.createdAt >= newRecord.version.createdAt ||
        // Deleted record.
        "noContent" in latest
      ) {
        return applyUpdates(
          state,
          [],
          [latest, ...linkedRecords, ...followingUpdates]
        );
      }

      // TODO: Call a "onConflict" handler to expose resolution.
      const newMutation: Mutation<T> = {
        state: applyUpdates(state, [], [latest]).state,
        record,
        followingUpdates,
      };

      return performRequest(newMutation, attempt + 1);
    } catch (err) {
      // Permanent error.
      if (
        Http.isError(err, [
          HttpStatusCode.BAD_REQUEST,
          HttpStatusCode.NOT_FOUND,
        ])
      ) {
        return applyUpdates(state, [], followingUpdates);
      }

      throw err;
    }
  };

  return performRequest(mutation, 1);
}
