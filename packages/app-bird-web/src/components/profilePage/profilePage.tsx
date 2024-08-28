import {useProfilePageState} from "@baqhub/bird-shared/state/profilePage/profilePageState.js";
import {createRoute} from "@tanstack/react-router";
import {FC, Suspense} from "react";
import {appRoute} from "../app.js";
import {LoadingPosts} from "../shared/posts/loadingPosts.js";
import {OtherProfilePage} from "./otherProfilePage.js";
import {UserProfilePage} from "./userProfilePage.js";

//
// Component.
//

export const ProfilePage: FC = () => {
  const {entity} = profileRoute.useParams();
  const {isUser} = useProfilePageState(entity);

  return (
    <Suspense fallback={<LoadingPosts />}>
      {isUser ? <UserProfilePage /> : <OtherProfilePage otherEntity={entity} />}
    </Suspense>
  );
};

//
// Route.
//

export const profileRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/profile/$entity",
  component: ProfilePage,
});
