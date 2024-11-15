import {FC, PropsWithChildren} from "react";
import tiwi from "tiwi";

//
// Props.
//

interface PostLinkProps extends PropsWithChildren {
  href: string;
}

//
// Style.
//

const Link = tiwi.a`
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
