import {Link} from "@tanstack/react-router";
import {FC, PropsWithChildren} from "react";
import tiwi from "tiwi";

//
// Props.
//

interface PostMentionProps extends PropsWithChildren {
  entity: string;
}

//
// Style.
//

const MentionLink = tiwi(Link)`
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
