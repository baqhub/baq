import {Array, RecordPermissions, isDefined} from "@baqhub/sdk";
import {useConstant} from "@baqhub/sdk-react";
import {useCallback, useState} from "react";
import {PostRecord} from "../baq/postRecord.js";
import {useFindEntityRecord, useRecordHelpers} from "../baq/store.js";
import {Facets} from "../helpers/facets.js";

//
// Constants.
//

const placeholders = [
  "What's on your mind?",
  "Got something to share with the world?",
  "Feeling chatty? What's up?",
  "What's your thought of the day?",
];

//
// Props.
//

interface UsePostComposerStateProps {
  mention: string | undefined;
}

//
// State hook.
//

export function usePostComposerState({mention}: UsePostComposerStateProps) {
  const {entity, updateRecords} = useRecordHelpers();

  const user = useFindEntityRecord(entity);
  if (!user) {
    throw new Error("User not found.");
  }

  const placeholder = useConstant(() => Array.randomItem(placeholders));
  const [text, setText] = useState(mention ? `@${mention} ` : "");

  const onPostPress = useCallback(
    (newText?: string) => {
      const trimmedText = (newText || text).trim();
      if (!trimmedText) {
        return;
      }

      // Find mentions and links.
      const textFacets = Facets.findAll(trimmedText);

      // TODO: Verify and remove invalid mentions.
      const notify = textFacets
        .map(facet => (facet.type === "mention" ? facet.mention : undefined))
        .filter(isDefined);

      const postRecord = PostRecord.new(
        entity,
        {text: trimmedText, textFacets},
        {permissions: {...RecordPermissions.public, notify}}
      );

      updateRecords([postRecord]);
      setText("");
    },
    [entity, updateRecords, text]
  );

  return {
    placeholder,
    entity,
    name: user.content.profile.name,
    text,
    onTextChange: setText,
    onPostPress,
  };
}
