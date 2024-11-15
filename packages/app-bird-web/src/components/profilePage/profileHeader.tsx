import {Column, Row, Text} from "@baqhub/ui/core/style.js";
import {FC, PropsWithChildren} from "react";
import tiwi from "tiwi";
import {Avatar} from "../shared/avatar.js";

//
// Props.
//

interface ProfileHeaderProps extends PropsWithChildren {
  entity: string;
  name: string | undefined;
  bio: string | undefined;
}

//
// Style.
//

const Profile = tiwi(Column)`
  py-10
  px-3

  gap-6
`;

const ProfileTop = tiwi(Row)`
  items-center
`;

const ProfileTopLeft = tiwi(Column)`
  grow
`;

const ProfileName = tiwi(Text)`
  text-2xl
  font-semibold
`;

const ProfileEntity = tiwi(Text)`
  text-md
`;

const ProfileTopAvatar = tiwi(Column)`
`;

const ProfileBio = tiwi(Text)`
  text-md
`;

//
// Component.
//

export const ProfileHeader: FC<ProfileHeaderProps> = props => {
  const {entity, name, bio, children} = props;
  return (
    <Profile>
      <ProfileTop>
        <ProfileTopLeft>
          <ProfileName>{name || entity}</ProfileName>
          {name && <ProfileEntity>{entity}</ProfileEntity>}
        </ProfileTopLeft>
        <ProfileTopAvatar>
          <Avatar entity={entity} size="large" />
        </ProfileTopAvatar>
      </ProfileTop>
      {bio && <ProfileBio>{bio}</ProfileBio>}
      {children}
    </Profile>
  );
};
