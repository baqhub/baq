import {HandlerOf} from "@baqhub/sdk";
import {createContext, useContext} from "react";

//
// Context.
//

export interface DateServicesContextProps {
  dateTimeFormat: Intl.DateTimeFormat;
  dateFormat: Intl.DateTimeFormat;
  dayOfWeekFormat: Intl.DateTimeFormat;
  timeFormat: Intl.DateTimeFormat;
  relativeTimeFormat: Intl.RelativeTimeFormat;
  registerUpdater: (updater: HandlerOf<Date>) => () => void;
}

const DateServicesContext = createContext<DateServicesContextProps>({
  dayOfWeekFormat: Intl.DateTimeFormat("en-us"),
  dateTimeFormat: Intl.DateTimeFormat("en-us"),
  dateFormat: Intl.DateTimeFormat("en-us"),
  timeFormat: Intl.DateTimeFormat("en-us"),
  relativeTimeFormat: new Intl.RelativeTimeFormat("en-us"),
  registerUpdater: () => () => {},
});

//
// Provider.
//

export const DateServicesContextProvider = DateServicesContext.Provider;

//
// Hook.
//

export function useDateServicesContext() {
  return useContext(DateServicesContext);
}
