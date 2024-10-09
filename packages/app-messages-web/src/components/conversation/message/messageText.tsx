import {LinkedText, LinkProps} from "@baqhub/ui/core/linkedText.js";
import {tw} from "@baqhub/ui/core/style.js";
import {FC, PropsWithChildren} from "react";

//
// Style.
//

const Layout = tw.div`
  px-3
  text-neutral-900
`;

const Link = tw.a`
  break-all
  text-amber-700

  hover:underline
  underline-offset-2
`;

//
// Component.
//

function renderLink({href, children}: LinkProps) {
  return (
    <Link href={href} target="_blank">
      {children}
    </Link>
  );
}

export const MessageText: FC<PropsWithChildren> = ({children}) => {
  return (
    <Layout>
      <LinkedText renderLink={renderLink}>{children}</LinkedText>
    </Layout>
  );
};
