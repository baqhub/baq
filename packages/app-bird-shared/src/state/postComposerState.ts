import {Array, RecordPermissions, Str, isDefined} from "@baqhub/sdk";
import {useConstant} from "@baqhub/sdk-react";
import {useCallback, useState} from "react";
import {PostRecord, PostRecordContent} from "../baq/postRecord.js";
import {useFindEntityRecord, useRecordHelpers} from "../baq/store.js";

//
// Constants.
//

const placeholders = [
  "What's on your mind?",
  "Got something to share with the world?",
  "Feeling chatty? What's up?",
  "What's your thought of the day?",
];

// Matches mentions in the text.
// Based on https://github.com/regexhq/mentions-regex.
const regexMention =
  /(?:^|[^a-zA-Z0-9_@!@#$%&*])(?:(?:@|@)(?!\/))([a-zA-Z0-9/_.]+)(?:\b(?!@|@)|$)/g;

//
// Props.
//

interface UsePostComposerStateProps {
  mention: string | undefined;
}

//
// State hook.
//

type TextMention = Exclude<
  Extract<PostRecordContent, {text: string}>["textMentions"],
  undefined
>[number];

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

      // Find mentions.
      const matches = trimmedText.matchAll(regexMention);
      const textMentions = [...matches]
        .map((match): TextMention | undefined => {
          const entityText = match[1];
          if (!entityText || !isDefined(match.index)) {
            return undefined;
          }

          const index = match.index + match[0].indexOf("@");
          const unicodeIndex = Str.unicodeIndex(trimmedText, index);
          const unicodeLength = Str.unicodeLength("@" + entityText);

          // Default to .baq.run if a partial entity is found.
          const mentionedEntity = entityText.includes(".")
            ? entityText
            : `${entityText}.baq.run`;

          return {
            mention: {entity: mentionedEntity},
            index: unicodeIndex,
            length: unicodeLength,
          };
        })
        .filter(isDefined);

      // TODO: Verify and remove invalid mentions.
      const notify = textMentions.map(mention => mention.mention);

      const postRecord = PostRecord.new(
        entity,
        {text: trimmedText, textMentions},
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
