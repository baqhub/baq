import {TextFacet} from "@baqhub/bird-shared/helpers/facets.js";
import {BirdConstants} from "@baqhub/bird-shared/state/constants.js";
import {Str} from "@baqhub/sdk";
import {LinkedText} from "@baqhub/ui/core/linkedText.js";
import {FC, ReactNode} from "react";
import {PostLink} from "./postLink.js";
import {PostMention} from "./postMention.js";

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

  return textFacets
    .toSorted(f => f.index)
    .reduce((result, facet, index) => {
      const jsIndex = Str.jsLength(text, facet.index);

      // If first, add text before.
      if (index === 0 && jsIndex > 0) {
        const beforeText = text.slice(0, jsIndex);
        result.push(
          <LinkedText key="before" renderLink={PostLink}>
            {beforeText}
          </LinkedText>
        );
      }

      const jsLength = Str.jsLength(text.slice(jsIndex), facet.length);
      const facetEnd = jsIndex + jsLength;
      const facetText = text.slice(jsIndex, facetEnd);

      // Add facet.
      result.push(
        <Facet key={"facet-" + index} facet={facet} facetText={facetText} />
      );

      // Add text after.
      if (text.length > facetEnd) {
        const nextFacet = textFacets[index + 1];
        const afterTextEnd = nextFacet ? nextFacet.index : text.length;
        const afterText = text.slice(facetEnd, afterTextEnd);
        result.push(
          <LinkedText key={"after-" + index} renderLink={PostLink}>
            {afterText}
          </LinkedText>
        );
      }

      return result;
    }, [] as ReactNode[]);
};

interface FacetProps {
  facet: TextFacet;
  facetText: string;
}

const Facet: FC<FacetProps> = ({facet, facetText}) => {
  switch (facet.type) {
    case "mention": {
      const {entity} = facet.mention;
      return <PostMention entity={entity}>{facetText}</PostMention>;
    }

    case "web_link": {
      const linkText =
        facetText === facet.url &&
        facetText.length > BirdConstants.linkMaxLength
          ? facetText.substring(0, BirdConstants.linkMaxLength) + "…"
          : facetText;

      return <PostLink href={facet.url}>{linkText}</PostLink>;
    }

    default:
      return null;
  }
};
