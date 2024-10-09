import {tw} from "@baqhub/ui/core/style.js";
import {Link} from "@tanstack/react-router";
import {FC, PropsWithChildren} from "react";

//
// Props.
//

interface PostMentionProps extends PropsWithChildren {
  entity: string;
}

//
// Style.
//

const MentionLink = tw(Link)`
  font-normal
  text-amber-800
  dark:text-amber-500

  hover:underline
  underline-offset-2
` as typeof Link;

//
// Component.
//

export const PostMention: FC<PostMentionProps> = props => {
  const {entity, children} = props;
  return (
    <MentionLink to="/profile/$entity" params={{entity}}>
      {children}
    </MentionLink>
  );
};
