import {Async} from "@baqhub/sdk";
import {abortable} from "@baqhub/sdk-react";
import {openBrowserAsync, WebBrowserPresentationStyle} from "expo-web-browser";
import {FC, PropsWithChildren, useCallback, useEffect, useState} from "react";
import {amber} from "tailwindcss/colors";
import {Text, tw} from "../../helpers/style";

//
// Props.
//

interface PostLinkProps extends PropsWithChildren {
  href: string;
}

//
// Style.
//

const Link = tw(Text)`
  text-amber-700
  dark:text-amber-500
  active:opacity-50
`;

//
// Component.
//

export const PostLink: FC<PostLinkProps> = props => {
  const {href, children} = props;
  const [isBrowserVisible, setIsBrowserVisible] = useState(false);

  const onLinkPress = useCallback(async () => {
    setIsBrowserVisible(true);
  }, []);

  useEffect(() => {
    if (!isBrowserVisible) {
      return;
    }

    return abortable(async signal => {
      await openBrowserAsync(href, {
        dismissButtonStyle: "close",
        presentationStyle: WebBrowserPresentationStyle.PAGE_SHEET,
        controlsColor: amber[500],
      });
      Async.throwIfAborted(signal);
      setIsBrowserVisible(false);
    });
  }, [isBrowserVisible, href]);

  return (
    <Link onPress={onLinkPress} suppressHighlighting>
      {children}
    </Link>
  );
};
