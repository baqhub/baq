import {Column, Row, Text, tw} from "@baqhub/ui/core/style.js";
import {FC, PropsWithChildren} from "react";
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

const Profile = tw(Column)`
  py-10
  px-3

  gap-6
`;

const ProfileTop = tw(Row)`
  items-center
`;

const ProfileTopLeft = tw(Column)`
  grow
`;

const ProfileName = tw(Text)`
  text-2xl
  font-semibold
`;

const ProfileEntity = tw(Text)`
  text-md
`;

const ProfileTopAvatar = tw(Column)`
`;

const ProfileBio = tw(Text)`
  text-md
`;

//
// Component.
//

export const ProfileHeader: FC<ProfileHeaderProps> = props => {
  const {entity, name, bio} = props;
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
    </Profile>
  );
};
