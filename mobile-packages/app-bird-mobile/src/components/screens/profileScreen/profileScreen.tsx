import {
  ProfilePageMode,
  useProfilePageState,
} from "@baqhub/app-bird-shared/build/src/state/profilePage/profilePageState";
import {never} from "@baqhub/sdk";
import {FC} from "react";
import {OtherProfileScreen} from "./otherProfileScreen";
import {UserProfileScreen} from "./userProfileScreen";

//
// Props.
//

interface ProfileScreenProps {
  routePrefix: string;
  entity: string;
}

//
// Component.
//

export const ProfileScreen: FC<ProfileScreenProps> = props => {
  const {routePrefix, entity} = props;
  const {mode} = useProfilePageState(entity);

  switch (mode) {
    case ProfilePageMode.USER:
      return <UserProfileScreen routePrefix={routePrefix} />;

    case ProfilePageMode.OTHER_USER:
      return (
        <OtherProfileScreen routePrefix={routePrefix} otherEntity={entity} />
      );

    default:
      never();
  }
};
