import {
  AnyRecord,
  EntityLink,
  EntityRecord,
  NoContentRecord,
  Q,
  Query,
  RecordKey,
  RecordSource,
  StandingDecision,
  StandingRecord,
  StandingRecordContent,
  VersionHash,
} from "@baqhub/sdk";
import {
  EntityRecordsState,
  RecordVersions,
  UpdateRecords,
} from "./storeContext.js";

function pickRecord<T extends AnyRecord | NoContentRecord>(
  local: T | undefined,
  root: T | undefined
) {
  if (!local) {
    return root;
  }

  if (!root) {
    return local;
  }

  if (local.createdAt > root.createdAt) {
    return local;
  }

  return root;
}

type GetState<T extends AnyRecord> = () => EntityRecordsState<T>;

export function recordByVersion<T extends AnyRecord>(
  versions: RecordVersions<T>
) {
  return <Q extends T>(version: VersionHash<Q>): Extract<T, Q> => {
    return versions[version]! as any;
  };
}

export function recordByKey<T extends AnyRecord>(
  entity: string,
  proxyEntity: string
) {
  return (getState: GetState<T>) =>
    <Q extends T>(key: RecordKey<Q>): Extract<T, Q> => {
      const state = getState();

      const record = (() => {
        const localRecord = state[proxyEntity]?.dictionary[key as any];
        if (proxyEntity === entity) {
          return localRecord as any;
        }

        return pickRecord(
          localRecord,
          state[entity]?.dictionary[key as any]
        ) as any;
      })();

      if (!record || "noContent" in record) {
        throw new Error("This record does not exist: " + key);
      }

      return record;
    };
}

export function findRecordByKey<T extends AnyRecord>(
  entity: string,
  proxyEntity: string
) {
  return (getState: GetState<T>) =>
    <Q extends T>(key: RecordKey<Q>): Extract<T, Q> | undefined => {
      const record = (() => {
        const state = getState();

        const localRecord = state[proxyEntity]?.dictionary[key as any];
        if (proxyEntity === entity) {
          return localRecord as any;
        }

        return pickRecord(
          localRecord,
          state[entity]?.dictionary[key as any]
        ) as any;
      })();

      if ("noContent" in record) {
        throw new Error("This record does not exist: " + key);
      }

      return record;
    };
}

export function findRecordByQuery<T extends AnyRecord>(
  entity: string,
  proxyEntity: string
) {
  return (getState: GetState<T>) =>
    <Q extends T>(query: Query<Q>) => {
      const state = getState();

      const findRecord = (findEntity: string) => {
        const records = Query.filter(state[findEntity]?.list || [], {
          ...query,
          pageSize: 1,
        });

        if (records.length > 1) {
          throw new Error("Multiple records found.");
        }

        return records[0];
      };

      if (proxyEntity === entity) {
        return findRecord(proxyEntity);
      }

      return pickRecord(findRecord(proxyEntity), findRecord(entity));
    };
}

export function findEntityRecord<T extends AnyRecord>(
  entity: string,
  proxyEntity: string
) {
  const findRecord = findRecordByQuery(entity, proxyEntity);
  return (getState: GetState<T>) => (targetEntity: string) => {
    return findRecord(getState)({
      sources: [
        RecordSource.SELF,
        RecordSource.NOTIFICATION,
        RecordSource.SUBSCRIPTION,
        RecordSource.RESOLUTION,
      ],
      filter: Q.and(Q.author(targetEntity), Q.type(EntityRecord)),
    });
  };
}

export function findStandingRecord<T extends AnyRecord>(entity: string) {
  const findRecord = findRecordByQuery(entity, entity);
  return (getState: GetState<T>) => (publisherEntity: string) => {
    return findRecord(getState)({
      sources: [RecordSource.SELF],
      filter: Q.and(
        Q.author(entity),
        Q.type(StandingRecord),
        Q.entity("content.publisher", publisherEntity)
      ),
    });
  };
}

export function findStandingDecision<T extends AnyRecord>(entity: string) {
  const findRecord = findStandingRecord(entity);
  return (getState: GetState<T>) =>
    (publisherEntity: string): `${StandingDecision}` => {
      const standingRecord = findRecord(getState)(publisherEntity);
      if (!standingRecord) {
        return StandingDecision.UNDECIDED;
      }

      return standingRecord.content.decision;
    };
}

export function updateStandingDecision<T extends AnyRecord>(entity: string) {
  const findRecord = findStandingRecord(entity);
  return (getState: GetState<T>, updateRecord: UpdateRecords<T>) =>
    (publisherEntity: string, decision: StandingDecision) => {
      const standingRecord = findRecord(getState)(publisherEntity);

      const newContent: StandingRecordContent = {
        publisher: EntityLink.new(publisherEntity),
        decision,
      };

      const newStandingRecord = standingRecord
        ? StandingRecord.update(entity, standingRecord, newContent)
        : StandingRecord.new(entity, newContent);

      updateRecord([newStandingRecord]);
    };
}
