import {Mention} from "@baqhub/app-bird-shared/build/src/state/postState";
import {Str} from "@baqhub/sdk";
import sortBy from "lodash/sortBy";
import {ComponentType, FC, PropsWithChildren, ReactNode} from "react";
import {Text} from "react-native";

//
// Props.
//

interface MentionComponentProps extends PropsWithChildren {
  entity: string;
}

interface PostTextProps {
  text: string;
  textMentions: ReadonlyArray<Mention> | undefined;
  MentionComponent: ComponentType<MentionComponentProps>;
}

//
// Component.
//

export const PostText: FC<PostTextProps> = props => {
  const {text, textMentions, MentionComponent} = props;
  if (!textMentions || textMentions.length === 0) {
    return text;
  }

  return sortBy(textMentions, m => m.index).reduce((result, mention, index) => {
    const jsIndex = Str.jsLength(text, mention.index);

    // If first, add text before.
    if (index === 0 && jsIndex > 0) {
      const beforeText = text.slice(0, jsIndex);
      result.push(<Text key="before">{beforeText}</Text>);
    }

    const jsLength = Str.jsLength(text.slice(jsIndex), mention.length);
    const mentionEnd = jsIndex + jsLength;
    const mentionText = text.slice(jsIndex, mentionEnd);

    // Add mention.
    const {entity} = mention.mention;
    result.push(
      <MentionComponent key={"mention-" + index} entity={entity}>
        {mentionText}
      </MentionComponent>
    );

    // Add text after.
    if (text.length > mentionEnd) {
      const nextMention = textMentions[index + 1];
      const afterTextEnd = nextMention ? nextMention.index : text.length;
      const afterText = text.slice(mentionEnd, afterTextEnd);
      result.push(<Text key={"after-" + index}>{afterText}</Text>);
    }

    return result;
  }, [] as ReactNode[]);
};
