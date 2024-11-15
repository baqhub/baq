import {Async} from "@baqhub/sdk";
import {useAbortable} from "@baqhub/sdk-react";
import {SplashScreen} from "expo-router";
import {FC, PropsWithChildren, useState} from "react";
import {Image, View} from "react-native";
import tiwi from "tiwi";
import birdSplash from "../../assets/images/birdMobileSplash.png";

//
// Style.
//

const Background = tiwi(View)`
  absolute
  top-0
  left-0
  w-full
  h-full
  pointer-events-none

  bg-white
  dark:bg-neutral-950

  transition-opacity
  delay-[250ms]
  duration-[300ms]
  ease-out
`;

const LogoLayout = tiwi(View)`
  absolute
  top-0
  left-0
  w-full
  h-full
  pointer-events-none

  transition-opacity
  duration-[350ms]
  ease-in
`;

const Logo = tiwi(Image)`
  flex-1
  w-full
`;

//
// Component.
//

type SplashState = "loading" | "animating" | "hidden";

export const Splash: FC<PropsWithChildren> = ({children}) => {
  //
  // Logic.
  //

  const [state, setState] = useState<SplashState>("loading");

  const onImageLoad = () => {
    setState("animating");
  };

  useAbortable(
    async signal => {
      if (state !== "animating") {
        return;
      }

      SplashScreen.hideAsync();
      await Async.delay(1000, signal);
      setState("hidden");
    },
    [state]
  );

  //
  // Render.
  //

  const renderSplash = () => {
    if (state === "hidden") {
      return null;
    }

    const extraClass = state === "animating" ? "opacity-0" : undefined;
    return (
      <>
        <Background className={extraClass} />
        <LogoLayout className={extraClass}>
          <Logo source={birdSplash} onLoad={onImageLoad} resizeMode="contain" />
        </LogoLayout>
      </>
    );
  };

  return (
    <>
      {children}
      {renderSplash()}
    </>
  );
};
