import {unreachable} from "@baqhub/sdk";
import {FC, useEffect, useState} from "react";
import {useDateServicesContext} from "./dateServicesContext.js";

//
// Props.
//

interface RelativeDateFormatterProps {
  value: Date;
}

//
// State.
//

type Format = "now" | "minutes" | "hours" | "days" | "months" | "years";

interface State {
  format: Format;
  number: number;
}

const cutoff = 0.7;
const minuteLength = 60 * 1000;
const hourLength = 60 * minuteLength;
const dayLength = 24 * hourLength;
const monthLength = 30 * dayLength;
const yearLength = 365 * monthLength;

function stateFromValue(now: Date, value: Date): State {
  const timeSpan = Math.abs(now.getTime() - value.getTime());

  // Now.
  const minutes = timeSpan / minuteLength;
  if (minutes <= cutoff) {
    return {format: "now", number: 0};
  }

  // Minutes.
  const hours = timeSpan / hourLength;
  if (hours <= cutoff) {
    return {format: "minutes", number: Math.round(minutes)};
  }

  // Hours.
  const days = timeSpan / dayLength;
  if (days <= cutoff) {
    return {format: "hours", number: Math.round(hours)};
  }

  // Days.
  const months = timeSpan / monthLength;
  if (months <= cutoff) {
    return {format: "days", number: Math.round(days)};
  }

  // Months.
  const years = timeSpan / yearLength;
  if (years <= cutoff) {
    return {format: "months", number: Math.round(months)};
  }

  // Years.
  return {format: "years", number: Math.round(years)};
}

//
// Component.
//

export const RelativeDateFormatter: FC<RelativeDateFormatterProps> = props => {
  const {value} = props;
  const {registerUpdater} = useDateServicesContext();
  const [state, setState] = useState(() => stateFromValue(new Date(), value));

  useEffect(() => {
    return registerUpdater(now => setState(stateFromValue(now, value)));
  }, [value, registerUpdater]);

  switch (state.format) {
    case "now":
      return "now";

    case "minutes":
      return `${state.number}m`;

    case "hours":
      return `${state.number}h`;

    case "days":
      return `${state.number}d`;

    case "months":
      return `${state.number}mth`;

    case "years":
      return `${state.number}y`;

    default:
      unreachable(state.format);
  }
};
