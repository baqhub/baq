import {
  FloatingFocusManager,
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";
import {MouseEvent, ReactNode, useCallback, useState} from "react";
import {Dropdown} from "./dropdown.js";
import {DropdownContextProvider} from "./dropdownContext.js";

export function useDropdown() {
  // State.
  const [isOpen, setIsOpen] = useState(false);
  const {floatingStyles, refs, context} = useFloating<HTMLElement>({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom-start",
    middleware: [offset({mainAxis: 4, alignmentAxis: 0}), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  // Interactions.
  const dismiss = useDismiss(context);
  const {getFloatingProps} = useInteractions([dismiss]);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const openContextMenu = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      refs.setPositionReference({
        getBoundingClientRect() {
          return {
            width: 0,
            height: 0,
            x: e.clientX,
            y: e.clientY,
            top: e.clientY,
            right: e.clientX,
            bottom: e.clientY,
            left: e.clientX,
          };
        },
      });
      setIsOpen(true);
    },
    [refs]
  );

  const onRequestClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Component.
  const render = (content: () => ReactNode) => {
    if (!isOpen) {
      return null;
    }

    return (
      <FloatingPortal>
        <FloatingFocusManager context={context} modal={false}>
          <Dropdown
            ref={refs.setFloating}
            style={floatingStyles}
            getProps={getFloatingProps}
            onRequestClose={onRequestClose}
          >
            <DropdownContextProvider value={{onItemClick: onRequestClose}}>
              {content()}
            </DropdownContextProvider>
          </Dropdown>
        </FloatingFocusManager>
      </FloatingPortal>
    );
  };

  return {
    isOpen,
    setReference: refs.setReference,
    open,
    openContextMenu,
    render,
  };
}
