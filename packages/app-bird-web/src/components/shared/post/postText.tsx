import {Mention} from "@baqhub/bird-shared/state/postState.js";
import {Str} from "@baqhub/sdk";
import {LinkedText, LinkProps} from "@baqhub/ui/core/linkedText.js";
import {FC, ReactNode} from "react";
import {PostLink} from "./postLink.js";
import {PostMention} from "./postMention.js";

//
// Props.
//

interface PostTextProps {
  text: string;
  textMentions: ReadonlyArray<Mention> | undefined;
}

//
// Components.
//

function renderLink({href, content}: LinkProps) {
  return <PostLink href={href}>{content}</PostLink>;
}

export const PostText: FC<PostTextProps> = props => {
  const {text, textMentions} = props;
  if (!textMentions || textMentions.length === 0) {
    return <LinkedText renderLink={renderLink}>{text}</LinkedText>;
  }

  return textMentions
    .toSorted(m => m.index)
    .reduce((result, mention, index) => {
      const jsIndex = Str.jsLength(text, mention.index);

      // If first, add text before.
      if (index === 0 && jsIndex > 0) {
        const beforeText = text.slice(0, jsIndex);
        result.push(
          <LinkedText key="before" renderLink={renderLink}>
            {beforeText}
          </LinkedText>
        );
      }

      const jsLength = Str.jsLength(text.slice(jsIndex), mention.length);
      const mentionEnd = jsIndex + jsLength;
      const mentionText = text.slice(jsIndex, mentionEnd);

      // Add mention.
      const {entity} = mention.mention;
      result.push(
        <PostMention key={"mention-" + index} entity={entity}>
          {mentionText}
        </PostMention>
      );

      // Add text after.
      if (text.length > mentionEnd) {
        const nextMention = textMentions[index + 1];
        const afterTextEnd = nextMention ? nextMention.index : text.length;
        const afterText = text.slice(mentionEnd, afterTextEnd);
        result.push(
          <LinkedText key={"after-" + index} renderLink={renderLink}>
            {afterText}
          </LinkedText>
        );
      }

      return result;
    }, [] as ReactNode[]);
};
