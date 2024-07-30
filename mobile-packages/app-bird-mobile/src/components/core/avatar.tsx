import {useAvatarState} from "@baqhub/app-bird-shared/build/src/state/avatarState";
import {FC} from "react";
import {Image, View} from "react-native";
import {NoSymbolIcon} from "react-native-heroicons/outline";
import {Icon, tw} from "../../helpers/style";

//
// Props.
//

export type AvatarSize = "small" | "medium" | "large";

interface AvatarProps {
  entity: string | undefined;
  size?: AvatarSize;
}

//
// Style.
//

const Layout = tw(View)<AvatarSize>`
  relative
  shrink-0
  w-9
  h-9

  rounded-full
  bg-neutral-100
  dark:bg-neutral-800

  ${{
    medium: `
      w-11
      h-11
    `,
    large: `
      w-20
      h-20
    `,
  }}
`;

const BlockedPill = tw(View)`
  absolute

  rounded-full
  shadow
  -bottom-1
  -right-1
  p-0.5

  bg-red-500
  dark:bg-red-600
`;

const BlockPillIcon = tw(Icon)<AvatarSize>`
  w-4
  h-4
  text-white

  ${{
    large: `
      w-6
      h-6
    `,
  }}
`;

const AvatarImage = tw(Image)`
  flex-1
  w-full
  rounded-full
`;

//
// Component.
//

export const Avatar: FC<AvatarProps> = props => {
  const {entity, size} = props;
  const {avatarUrl, isBlocked} = useAvatarState(entity);

  return (
    <Layout variants={size}>
      <AvatarImage source={{uri: avatarUrl}} resizeMode="cover" />
      {isBlocked && (
        <BlockedPill variants={size}>
          <BlockPillIcon variants={size}>
            <NoSymbolIcon />
          </BlockPillIcon>
        </BlockedPill>
      )}
    </Layout>
  );
};
