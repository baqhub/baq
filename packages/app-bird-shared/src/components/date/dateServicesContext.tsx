import {Handler} from "@baqhub/sdk";
import {createContext, useContext} from "react";

//
// Context.
//

export interface DateServicesContextProps {
  dateTimeFormat: Intl.DateTimeFormat;
  registerUpdater: (updater: Handler) => () => void;
}

const DateServicesContext = createContext<DateServicesContextProps>({
  dateTimeFormat: Intl.DateTimeFormat("en-us"),
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
