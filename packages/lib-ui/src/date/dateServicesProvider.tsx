import {HandlerOf} from "@baqhub/sdk";
import {useConstant} from "@baqhub/sdk-react";
import {FC, PropsWithChildren, useEffect, useMemo} from "react";
import {
  DateServicesContextProps,
  DateServicesContextProvider,
  FormatRelativeDate,
} from "./dateServicesContext.js";

//
// Props.
//

interface DateServicesProviderProps extends PropsWithChildren {
  locale: string;
  timeZone?: string;
  formatRelativeDate?: FormatRelativeDate;
}

//
// Component.
//

export const DateServicesProvider: FC<DateServicesProviderProps> = props => {
  const {locale, timeZone, formatRelativeDate, children} = props;
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
        timeZone,
      }),
      dayOfWeekFormat: Intl.DateTimeFormat(locale, {
        weekday: "long",
        timeZone,
      }),
      dateFormat: Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        timeZone,
      }),
      timeFormat: Intl.DateTimeFormat(locale, {
        hour: "numeric",
        minute: "2-digit",
        timeZone,
      }),
      formatRelativeDate:
        formatRelativeDate || defaultFormatRelativeDate(locale),
      registerUpdater: (updater: HandlerOf<Date>) => {
        updaters.add(updater);
        return () => {
          updaters.delete(updater);
        };
      },
    }),
    [locale, timeZone, formatRelativeDate, updaters]
  );

  return (
    <DateServicesContextProvider value={context}>
      {children}
    </DateServicesContextProvider>
  );
};

function defaultFormatRelativeDate(locale: string): FormatRelativeDate {
  const format = new Intl.RelativeTimeFormat(locale, {
    style: "short",
    numeric: "auto",
  });

  return (value, unit) => format.format(value, unit);
}
