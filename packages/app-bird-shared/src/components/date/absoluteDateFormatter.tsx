import {FC, useMemo} from "react";
import {useDateServicesContext} from "./dateServicesContext.js";

//
// Props.
//

interface AbsoluteDateFormatterProps {
  value: Date;
}

//
// Component.
//

export const AbsoluteDateFormatter: FC<AbsoluteDateFormatterProps> = props => {
  const {value} = props;
  const {dateTimeFormat} = useDateServicesContext();

  return useMemo(() => {
    return dateTimeFormat.format(value);
  }, [dateTimeFormat, value]);
};
