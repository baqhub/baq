import {unreachable} from "@baqhub/sdk";
import capitalize from "lodash/capitalize.js";
import {FC, useEffect, useMemo, useState} from "react";
import {useDateServicesContext} from "./dateServicesContext.js";

//
// Props.
//

interface MixedDateFormatterProps {
  now?: Date;
  value: Date;
}

//
// State.
//

type Format = "now" | "minutes" | "today" | "yesterday" | "days" | "more";

interface State {
  format: Format;
  number: number;
}

const cutoff = 0.7;
const minuteLength = 60 * 1000;
const hourLength = 60 * minuteLength;
const dayLength = 24 * hourLength;
const weekLength = 7 * dayLength;

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDay() === date2.getDay()
  );
}

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

  // Today.
  if (isSameDay(now, value)) {
    return {format: "today", number: 0};
  }

  // Yesterday.
  const valuePlusDay = new Date(value.getTime() + dayLength);
  if (isSameDay(now, valuePlusDay)) {
    return {format: "yesterday", number: 0};
  }

  // Days.
  const weeks = timeSpan / weekLength;
  if (weeks <= cutoff) {
    return {format: "days", number: 0};
  }

  // More.
  return {format: "more", number: 0};
}

//
// Component.
//

export const MixedDateFormatter: FC<MixedDateFormatterProps> = props => {
  const {now, value} = props;
  const dateServicesContext = useDateServicesContext();
  const {dayOfWeekFormat, dateFormat, timeFormat} = dateServicesContext;
  const {relativeTimeFormat, registerUpdater} = dateServicesContext;
  const [state, setState] = useState(() =>
    stateFromValue(now || new Date(), value)
  );

  useEffect(() => {
    return registerUpdater(now => setState(stateFromValue(now, value)));
  }, [value, registerUpdater]);

  return useMemo(() => {
    switch (state.format) {
      case "now":
        return "Now";

      case "minutes":
        return relativeTimeFormat.format(-state.number, "minutes");

      case "today":
        return timeFormat.format(value);

      case "yesterday":
        return capitalize(relativeTimeFormat.format(-1, "day"));

      case "days":
        return capitalize(dayOfWeekFormat.format(value));

      case "more":
        return dateFormat.format(value);

      default:
        unreachable(state.format);
    }
  }, [
    dayOfWeekFormat,
    dateFormat,
    timeFormat,
    relativeTimeFormat,
    state,
    value,
  ]);
};
