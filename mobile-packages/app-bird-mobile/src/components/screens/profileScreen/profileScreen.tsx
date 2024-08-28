import {useProfilePageState} from "@baqhub/app-bird-shared/build/src/state/profilePage/profilePageState";
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
  const {isUser} = useProfilePageState(entity);

  if (isUser) {
    return <UserProfileScreen routePrefix={routePrefix} />;
  }

  return <OtherProfileScreen routePrefix={routePrefix} otherEntity={entity} />;
};
