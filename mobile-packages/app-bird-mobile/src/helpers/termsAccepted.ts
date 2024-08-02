import * as SecureStore from "expo-secure-store";
import {SecureStoreOptions} from "expo-secure-store";

const options: SecureStoreOptions = {
  requireAuthentication: false,
  keychainAccessible: SecureStore.ALWAYS,
  keychainService: "com.baqhub.ios.bird",
};

const termsAcceptedAtKey = "terms_accepted_at";

async function findHasAcceptedTerms() {
  const acceptedAtString = await SecureStore.getItemAsync(
    termsAcceptedAtKey,
    options
  );

  const acceptedAt = acceptedAtString && new Date(acceptedAtString);
  if (!acceptedAt || Number.isNaN(acceptedAt.getTime())) {
    return false;
  }

  return true;
}

async function acceptTerms() {
  const acceptedAtString = new Date().toISOString();
  await SecureStore.setItemAsync(termsAcceptedAtKey, acceptedAtString, options);
}

export const TermsAccepted = {
  find: findHasAcceptedTerms,
  accept: acceptTerms,
};
