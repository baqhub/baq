import {useAvatarState} from "@baqhub/bird-shared/state/avatarState.js";
import {NoSymbolIcon} from "@heroicons/react/24/outline";
import {UserIcon} from "@heroicons/react/24/solid";
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

const Layout = tiwi.div<AvatarSize>`
  relative
  flex
  size-9

  shrink-0
  items-center
  justify-center

  rounded-full
  bg-amber-400
  bg-cover
  dark:bg-amber-700

  ${{
    large: `size-20`,
  }}
`;

const Placeholder = tiwi.div<AvatarSize>`
  size-5
  text-amber-800

  ${{
    large: `size-9`,
  }}
`;

const BlockedPill = tiwi.div<AvatarSize>`
  absolute
  -bottom-1
  -right-1
  size-5

  rounded-full
  bg-red-500

  p-[2px]
  text-white
  shadow
  shadow-red-800/30
  dark:bg-red-600

  ${{
    large: `
      size-7
      bottom-0
      right-0

      p-[3px]
      shadow-md
    `,
  }}
`;

//
// Component.
//

export const Avatar: FC<AvatarProps> = props => {
  const {entity, size} = props;
  const {avatarUrl, isBlocked} = useAvatarState(entity);

  return (
    <Layout
      variants={size}
      style={avatarUrl ? {backgroundImage: `url(${avatarUrl})`} : {}}
    >
      {!avatarUrl && (
        <Placeholder variants={size}>
          <UserIcon />
        </Placeholder>
      )}
      {isBlocked && (
        <BlockedPill variants={size}>
          <NoSymbolIcon className="stroke-[1.8]" />
        </BlockedPill>
      )}
    </Layout>
  );
};
