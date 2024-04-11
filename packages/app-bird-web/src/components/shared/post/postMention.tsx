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

const mentionLinkStyle = `
  font-normal
  text-amber-800
  dark:text-amber-500

  hover:underline
  underline-offset-2
`;

//
// Component.
//

export const PostMention: FC<PostMentionProps> = props => {
  const {entity, children} = props;
  return (
    <Link to="/profile/$entity" params={{entity}} className={mentionLinkStyle}>
      {children}
    </Link>
  );
};
