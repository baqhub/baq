import {tw} from "@baqhub/ui/core/style.js";
import {FC, PropsWithChildren} from "react";

//
// Props.
//

interface PostLinkProps extends PropsWithChildren {
  href: string;
}

//
// Style.
//

const Link = tw.a`
  font-normal
  text-amber-800
  dark:text-amber-500

  hover:underline
  underline-offset-2
`;

//
// Component.
//

export const PostLink: FC<PostLinkProps> = props => {
  const {href, children} = props;
  return (
    <Link href={href} target="_blank">
      {children}
    </Link>
  );
};
