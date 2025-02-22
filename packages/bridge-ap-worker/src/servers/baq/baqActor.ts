export interface BaqActor {
  id: string;
  server: string;
  username: string;
}

function toHandle(path: BaqActor) {
  return `${path.username}@${path.server}`;
}

function equals(path1: BaqActor, path2: BaqActor) {
  return path1.server === path2.server && path1.username === path2.username;
}

export const BaqActor = {
  toHandle,
  equals,
};
