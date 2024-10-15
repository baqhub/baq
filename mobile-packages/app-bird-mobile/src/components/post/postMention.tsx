import {Link} from "expo-router";
import {FC, PropsWithChildren} from "react";
import {Text, tw} from "../../helpers/style";

//
// Props.
//

interface PostMentionProps extends PropsWithChildren {
  routePrefix: string;
  entity: string;
}

//
// Style.
//

const Mention = tw(Text)`
  text-amber-700
  dark:text-amber-500
  active:opacity-50
`;

//
// Component.
//

export const PostMention: FC<PostMentionProps> = props => {
  const {routePrefix, entity, children} = props;
  return (
    <Link
      href={{
        pathname: `${routePrefix}/profile/[entity]` as any,
        params: {entity},
      }}
      asChild
    >
      <Mention numberOfLines={1} suppressHighlighting>
        {children}
      </Mention>
    </Link>
  );
};
