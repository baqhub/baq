import {RendererOf} from "@baqhub/sdk-react";
import Linkify from "linkify-react";
import {IntermediateRepresentation} from "linkifyjs";
import {FC, PropsWithChildren, useCallback} from "react";

//
// Props.
//

export interface LinkProps {
  href: string;
  children: string;
}

interface LinkedTextProps extends PropsWithChildren {
  renderLink: RendererOf<LinkProps>;
}

//
// Component.
//

export const LinkedText: FC<LinkedTextProps> = props => {
  const {renderLink, children} = props;

  const render = useCallback(
    (token: IntermediateRepresentation) => {
      return renderLink({
        href: token.attributes["href"]!,
        children: token.content,
      });
    },
    [renderLink]
  );

  return (
    <Linkify
      options={{
        render,
        nl2br: true,
        truncate: 20,
      }}
    >
      {children}
    </Linkify>
  );
};
