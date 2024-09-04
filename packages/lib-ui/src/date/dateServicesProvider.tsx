import {HandlerOf} from "@baqhub/sdk";
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
  const updaters = useConstant(() => new Set<HandlerOf<Date>>());

  useEffect(() => {
    // 30s interval.
    const intervalId = setInterval(() => {
      const now = new Date();
      updaters.forEach(u => u(now));
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
      dayOfWeekFormat: Intl.DateTimeFormat(locale, {
        weekday: "long",
      }),
      dateFormat: Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }),
      timeFormat: Intl.DateTimeFormat(locale, {
        hour: "numeric",
        minute: "2-digit",
      }),
      relativeTimeFormat: new Intl.RelativeTimeFormat(locale, {
        style: "short",
        numeric: "auto",
      }),
      registerUpdater: (updater: HandlerOf<Date>) => {
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
