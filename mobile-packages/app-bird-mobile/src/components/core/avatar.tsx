import {useAvatarState} from "@protocol-apps/app-bird-shared/build/src/state/avatarState";
import {FC} from "react";
import {Image, View} from "react-native";
import {tw} from "../../helpers/style";

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
  const {avatarUrl} = useAvatarState(entity);

  return (
    <Layout variants={size}>
      <AvatarImage source={{uri: avatarUrl}} resizeMode="cover" />
    </Layout>
  );
};
