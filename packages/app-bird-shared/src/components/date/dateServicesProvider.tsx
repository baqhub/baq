import {Handler} from "@baqhub/sdk";
import {useConstant} from "@baqhub/sdk-react";
import {FC, PropsWithChildren, useEffect, useMemo} from "react";
import {
  DateServicesContextProps,
  DateServicesContextProvider,
} from "./dateServicesContext.js";

//
// Props.
//

interface DateServicesProviderProps extends PropsWithChildren {
  locale: string;
}

//
// Component.
//

export const DateServicesProvider: FC<DateServicesProviderProps> = props => {
  const {locale, children} = props;
  const updaters = useConstant(() => new Set<Handler>());

  useEffect(() => {
    // 30s interval.
    const intervalId = setInterval(() => {
      updaters.forEach(u => u());
    }, 30 * 1000);

    return () => clearInterval(intervalId);
  }, [updaters]);

  const context = useMemo<DateServicesContextProps>(
    () => ({
      dateTimeFormat: Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      registerUpdater: (updater: Handler) => {
        updaters.add(updater);
        return () => {
          updaters.delete(updater);
        };
      },
    }),
    [locale, updaters]
  );

  return (
    <DateServicesContextProvider value={context}>
      {children}
    </DateServicesContextProvider>
  );
};
