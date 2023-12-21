const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function formatRfc822(date: Date): string {
  // Sat, 16 Dec 2023 10:30:59 +0000
  const dayOfWeek = DAYS_OF_WEEK[date.getDay()];
  const month = MONTHS[date.getMonth()];
  const timezone = calcTimezone(date.getTimezoneOffset());
  return `${dayOfWeek}, ${date.getDate()} ${month} ${date.getFullYear()} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${timezone}`;
}

function pad(num: number): string {
  if (num < 10) {
    return `0${num}`;
  }
  return num.toString();
}

function calcTimezone(offsetMin: number): string {
  const absMin = Math.abs(offsetMin);
  const offsetHour = Math.floor(absMin / 60);
  const modMin = absMin % 60;
  const sign = offsetMin <= 0 ? "+" : "-";
  return `${sign}${pad(offsetHour)}${pad(modMin)}`;
}
