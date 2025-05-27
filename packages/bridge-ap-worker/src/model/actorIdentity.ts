export interface ActorIdentity {
  server: string;
  handle: string;
}

function identityOfEntity(
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

function identityToEntity(domain: string, identity: ActorIdentity) {
  const handleAndServer = `${identity.handle}.${identity.server}`;
  const subdomain = handleAndServer.replaceAll("-", "--").replaceAll(".", "-");
  return `${subdomain}.${domain}`;
}

function identityToIdentifier(identity: ActorIdentity) {
  const {handle, server} = identity;
  return `${handle}@${server}`;
}

export const ActorIdentity = {
  ofEntity: identityOfEntity,
  toEntity: identityToEntity,
  toIdentifier: identityToIdentifier,
};
