import {
  ProfilePageMode,
  useProfilePageState,
} from "@baqhub/bird-shared/state/profilePage/profilePageState.js";
import {unreachable} from "@baqhub/sdk";
import {createRoute} from "@tanstack/react-router";
import {FC, Suspense} from "react";
import {appRoute} from "../app.js";
import {LoadingPosts} from "../shared/posts/loadingPosts.js";
import {OtherProfilePage} from "./otherProfilePage.js";
import {PublicProfilePage} from "./publicProfilePage.js";
import {UserProfilePage} from "./userProfilePage.js";

//
// Component.
//

export const ProfilePage: FC = () => {
  const {entity} = profileRoute.useParams();
  const {mode} = useProfilePageState(entity);

  const renderContent = () => {
    switch (mode) {
      case ProfilePageMode.PUBLIC:
        return <PublicProfilePage publicEntity={entity} />;

      case ProfilePageMode.USER:
        return <UserProfilePage />;

      case ProfilePageMode.OTHER_USER:
        return <OtherProfilePage otherEntity={entity} />;

      default:
        unreachable(mode);
    }
  };

  return <Suspense fallback={<LoadingPosts />}>{renderContent()}</Suspense>;
};

//
// Route.
//

export const profileRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/profile/$entity",
  component: ProfilePage,
});
