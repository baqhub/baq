import {HandlerOf} from "@baqhub/sdk";
import {createContext, useContext} from "react";

//
// Context.
//

export type FormatRelativeDate = (
  value: number,
  unit: Intl.RelativeTimeFormatUnit
) => string;

export interface DateServicesContextProps {
  dateTimeFormat: Intl.DateTimeFormat;
  dateFormat: Intl.DateTimeFormat;
  dayOfWeekFormat: Intl.DateTimeFormat;
  timeFormat: Intl.DateTimeFormat;
  formatRelativeDate: FormatRelativeDate;
  registerUpdater: (updater: HandlerOf<Date>) => () => void;
}

const DateServicesContext = createContext<DateServicesContextProps | undefined>(
  undefined
);

//
// Provider.
//

export const DateServicesContextProvider = DateServicesContext.Provider;

//
// Hook.
//

export function useDateServicesContext() {
  const context = useContext(DateServicesContext);
  if (!context) {
    throw new Error("Date Services Provider required.");
  }

  return context;
}
