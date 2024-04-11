import {useAvatarState} from "@baqhub/bird-shared/state/avatarState.js";
import {tw} from "@baqhub/ui/core/style.js";
import {FC} from "react";

//
// Props.
//

export type AvatarSize = "small" | "large";

interface AvatarProps {
  entity: string;
  size?: AvatarSize;
}

//
// Style.
//

const Layout = tw.div`
  shrink-0

  rounded-full
  bg-cover
  bg-amber-400
  dark:bg-amber-700
`;

const layoutSizeStyle: Record<AvatarSize, string> = {
  small: `
    w-9
    h-9
  `,
  large: `
    w-20
    h-20
  `,
};

//
// Component.
//

export const Avatar: FC<AvatarProps> = props => {
  const {entity, size} = props;
  const {avatarUrl} = useAvatarState(entity);
  const layoutStyle = layoutSizeStyle[size || "small"];

  return (
    <Layout
      className={layoutStyle}
      style={avatarUrl ? {backgroundImage: `url(${avatarUrl})`} : {}}
    />
  );
};
