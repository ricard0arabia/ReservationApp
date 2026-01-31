import { DateTime } from "luxon";
import { config } from "../config.js";

export const nowManila = () => DateTime.now().setZone(config.timezone);

export const toManilaDate = (date: string, hour: number) => {
  return DateTime.fromISO(date, { zone: config.timezone }).set({ hour, minute: 0, second: 0, millisecond: 0 });
};

export const toIso = (dt: DateTime) => dt.toISO({ suppressMilliseconds: true }) ?? "";

export const parseIso = (value: string) => DateTime.fromISO(value, { zone: config.timezone });

export const formatDate = (dt: DateTime) => dt.toFormat("yyyy-LL-dd");

export const diffHours = (start: DateTime, end: DateTime) => Math.round(end.diff(start, "hours").hours);
