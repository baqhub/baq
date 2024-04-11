import {v4 as uuid} from "uuid";

function buildUuid() {
  return uuid().replaceAll("-", "");
}

export const Uuid = {
  new: buildUuid,
};
