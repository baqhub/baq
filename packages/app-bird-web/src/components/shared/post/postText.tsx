import {TextFacet} from "@baqhub/bird-shared/helpers/facets.js";
import {LinkedText} from "@baqhub/ui/core/linkedText.js";
import {FC} from "react";
import {PostLink} from "./postLink.js";

//
// Props.
//

interface PostTextProps {
  text: string;
  textFacets: ReadonlyArray<TextFacet> | undefined;
}

//
// Components.
//

export const PostText: FC<PostTextProps> = props => {
  const {text, textFacets} = props;
  if (!textFacets || textFacets.length === 0) {
    return <LinkedText renderLink={PostLink}>{text}</LinkedText>;
  }

  return <LinkedText renderLink={PostLink}>{text}</LinkedText>;

  // return textFacets
  //   .toSorted(m => m.index)
  //   .reduce((result, mention, index) => {
  //     const jsIndex = Str.jsLength(text, mention.index);

  //     // If first, add text before.
  //     if (index === 0 && jsIndex > 0) {
  //       const beforeText = text.slice(0, jsIndex);
  //       result.push(
  //         <LinkedText key="before" renderLink={PostLink}>
  //           {beforeText}
  //         </LinkedText>
  //       );
  //     }

  //     const jsLength = Str.jsLength(text.slice(jsIndex), mention.length);
  //     const mentionEnd = jsIndex + jsLength;
  //     const mentionText = text.slice(jsIndex, mentionEnd);

  //     // Add mention.
  //     const {entity} = mention.mention;
  //     result.push(
  //       <PostMention key={"mention-" + index} entity={entity}>
  //         {mentionText}
  //       </PostMention>
  //     );

  //     // Add text after.
  //     if (text.length > mentionEnd) {
  //       const nextMention = textMentions[index + 1];
  //       const afterTextEnd = nextMention ? nextMention.index : text.length;
  //       const afterText = text.slice(mentionEnd, afterTextEnd);
  //       result.push(
  //         <LinkedText key={"after-" + index} renderLink={PostLink}>
  //           {afterText}
  //         </LinkedText>
  //       );
  //     }

  //     return result;
  //   }, [] as ReactNode[]);
};
