import {useAvatarState} from "@baqhub/bird-shared/state/avatarState.js";
import {NoSymbolIcon} from "@heroicons/react/24/outline";
import {FC} from "react";
import tiwi from "tiwi";

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

const Layout = tiwi.div`
  shrink-0
  relative

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

const BlockedPill = tiwi.div`
  absolute

  rounded-full
  shadow
  shadow-red-800/30

  bg-red-500
  dark:bg-red-600
  text-white
`;

const blockedPillSizeStyle: Record<AvatarSize, string> = {
  small: `
    -bottom-1
    -right-1
    p-[2px]

    w-5
    h-5
  `,
  large: `
    bottom-0
    right-0
    p-[3px]

    w-7
    h-7
    shadow-md
  `,
};

//
// Component.
//

export const Avatar: FC<AvatarProps> = props => {
  const {entity, size} = props;
  const {avatarUrl, isBlocked} = useAvatarState(entity);
  const layoutStyle = layoutSizeStyle[size || "small"];
  const blockedPillStyle = blockedPillSizeStyle[size || "small"];

  return (
    <Layout
      className={layoutStyle}
      style={avatarUrl ? {backgroundImage: `url(${avatarUrl})`} : {}}
    >
      {isBlocked && (
        <BlockedPill className={blockedPillStyle}>
          <NoSymbolIcon className="stroke-[1.8]" />
        </BlockedPill>
      )}
    </Layout>
  );
};
