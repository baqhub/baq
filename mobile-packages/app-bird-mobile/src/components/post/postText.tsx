import {Mention} from "@baqhub/app-bird-shared/build/src/state/postState";
import {Str} from "@baqhub/sdk";
import {LinkedText, LinkProps} from "@baqhub/ui/build/src/core/linkedText";
import sortBy from "lodash/sortBy";
import {FC, PropsWithChildren, ReactNode} from "react";
import {Text} from "react-native";
import {PostLink} from "./postLink";
import {PostMention} from "./postMention";

//
// Props.
//

interface PostTextProps {
  text: string;
  textMentions: ReadonlyArray<Mention> | undefined;
}

//
// Component.
//

function renderText(source: string) {
  return <Text>{source}</Text>;
}

function renderLink(props: LinkProps) {
  return <PostLink {...props} />;
}

const MobileLinkedText: FC<PropsWithChildren> = ({children}) => {
  return (
    <LinkedText
      newLineToBr={false}
      renderText={renderText}
      renderLink={renderLink}
    >
      {children}
    </LinkedText>
  );
};

export const PostText: FC<PostTextProps> = props => {
  const {text, textMentions} = props;
  if (!textMentions || textMentions.length === 0) {
    return <MobileLinkedText>{text}</MobileLinkedText>;
  }

  return sortBy(textMentions, m => m.index).reduce((result, mention, index) => {
    const jsIndex = Str.jsLength(text, mention.index);

    // If first, add text before.
    if (index === 0 && jsIndex > 0) {
      const beforeText = text.slice(0, jsIndex);
      result.push(
        <MobileLinkedText key="before">{beforeText}</MobileLinkedText>
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
        <MobileLinkedText key={"after-" + index}>{afterText}</MobileLinkedText>
      );
    }

    return result;
  }, [] as ReactNode[]);
};
