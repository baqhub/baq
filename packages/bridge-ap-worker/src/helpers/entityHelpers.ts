export interface ActorIdentity {
  server: string;
  handle: string;
}

export function entityToIdentity(
  domain: string,
  entity: string
): ActorIdentity | undefined {
  const subdomain = entity.slice(0, -domain.length - 1);
  const handleAndServer = subdomain.replace(/--|-/g, m =>
    m === "--" ? "-" : "."
  );

  const handleAndServerParts = handleAndServer.split(".");

  if (handleAndServerParts.length < 3) {
    return undefined;
  }

  const handle = handleAndServerParts.slice(0, -2).join(".");
  const server = handleAndServerParts.slice(-2).join(".");

  return {handle, server};
}

export function identityToEntity(identity: ActorIdentity);
