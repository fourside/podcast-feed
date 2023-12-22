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

const timeFormatter = new Intl.DateTimeFormat("ja-JP", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export function formatRfc822(date: Date): string {
  // Sat, 16 Dec 2023 10:30:59 +0000
  const dayOfWeek = DAYS_OF_WEEK[date.getDay()];
  const month = MONTHS[date.getMonth()];
  const time = timeFormatter.format(date);
  const timezone = calcTimezone(date.getTimezoneOffset());
  return `${dayOfWeek}, ${date.getDate()} ${month} ${date.getFullYear()} ${time} ${timezone}`;
}

function calcTimezone(offsetMin: number): string {
  const absMin = Math.abs(offsetMin);
  const offsetHour = Math.floor(absMin / 60);
  const modMin = absMin % 60;
  const sign = offsetMin <= 0 ? "+" : "-";
  return `${sign}${pad(offsetHour)}${pad(modMin)}`;
}

function pad(num: number): string {
  if (num < 0) {
    throw new Error("use Math.abs");
  }
  const numString = num.toString();
  return numString.length < 2 ? `0${numString}` : numString;
}

if (import.meta.vitest !== undefined) {
  const { describe, test, expect } = import.meta.vitest;
  describe(calcTimezone.name, () => {
    test("negative", () => {
      // arrange
      const offsetMin = -245;
      // act
      const result = calcTimezone(offsetMin);
      // assert
      expect(result).toBe("+0405");
    });

    test("positive", () => {
      // arrange
      const offsetMin = 123;
      // act
      const result = calcTimezone(offsetMin);
      // assert
      expect(result).toBe("-0203");
    });

    test("zero", () => {
      // arrange
      const offsetMin = 0;
      // act
      const result = calcTimezone(offsetMin);
      // assert
      expect(result).toBe("+0000");
    });
  });
}
