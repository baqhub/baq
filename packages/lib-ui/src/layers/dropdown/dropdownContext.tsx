import {Handler, noop} from "@baqhub/sdk";
import {createContext, useContext} from "react";

interface DropdownContextProps {
  onItemClick: Handler;
}

const DropdownContext = createContext<DropdownContextProps>({
  onItemClick: noop,
});

export const DropdownContextProvider = DropdownContext.Provider;

export function useDropdownContext() {
  return useContext(DropdownContext);
}
