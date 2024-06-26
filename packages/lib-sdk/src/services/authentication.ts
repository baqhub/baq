import {BlobLink} from "../model/links/blobLink.js";
import {AuthenticationState} from "../model/local/authenticationState.js";
import {AppRecord, AppRecordContent} from "../model/recordTypes/appRecord.js";
import {buildServerCredentialsRecord} from "../model/recordTypes/serverCredentialsRecord.js";
import {Client} from "./client.js";

export interface StartAuthenticationOptions {
  icon?: Blob;
  signal?: AbortSignal;
}

const allowedIconTypes = ["image/jpeg", "image/png"];

async function register(
  entity: string,
  appContent: AppRecordContent,
  {icon, signal}: StartAuthenticationOptions = {}
) {
  // Perform discovery.
  const client = await Client.discover(entity, signal);
  const entityRecord = await client.getEntityRecord();

  // Upload the app icon, if any.
  const iconLink = await (async () => {
    if (!icon) {
      return undefined;
    }

    if (!allowedIconTypes.includes(icon.type)) {
      throw new Error("Unsupported icon mime type.");
    }

    const blob = await client.uploadBlob(icon, signal);
    return BlobLink.new(blob, icon.type, "icon");
  })();

  // Add the icon (if any) to the app record content.
  const fullAppContent: AppRecordContent = {
    ...appContent,
    icon: iconLink,
  };

  // Create the app record.
  const appRecord = AppRecord.new(entityRecord.author.entity, fullAppContent);
  const credentialsRecord = buildServerCredentialsRecord(appRecord);

  const authenticatedClient = Client.authenticated({
    authorizationId: undefined,
    entityRecord,
    appRecord,
    credentialsRecord,
    serverPublicKey: "",
  });

  const [serverPublicKey, serverAppRecord] =
    await authenticatedClient.postAppRecord(
      appRecord,
      credentialsRecord,
      signal
    );

  // Resolve the authentication flow URL.
  const flowUrl = await client.expandUrlTemplate(
    "auth",
    {record_id: appRecord.id},
    signal
  );

  const state: AuthenticationState = {
    authorizationId: undefined,
    entityRecord,
    appRecord: serverAppRecord,
    credentialsRecord,
    serverPublicKey,
  };

  return {
    flowUrl,
    state,
  };
}

function complete(
  state: AuthenticationState,
  authorizationId: string
): AuthenticationState {
  return {
    ...state,
    authorizationId,
  };
}

export const Authentication = {
  register,
  complete,
};
