export interface AccountPath {
  server: string;
  username: string;
}

function equals(path1: AccountPath, path2: AccountPath) {
  return path1.server === path2.server && path1.username === path2.username;
}

export const AccountPath = {
  equals,
};
