import { describe, expect, test } from "vitest";
import { formatRfc822 } from "./format-rfc822";

describe(formatRfc822.name, () => {
  test("time has zero padding", () => {
    // arrange
    const date = new Date(2022, 2, 1, 3, 4, 5);
    // act
    const result = formatRfc822(date);
    // assert
    expect(result).toBe("Tue, 1 Mar 2022 03:04:05 +0000");
  });

  test("after 12 hour", () => {
    // arrange
    const date = new Date(2022, 2, 22, 13, 14, 15);
    // act
    const result = formatRfc822(date);
    // assert
    expect(result).toBe("Tue, 22 Mar 2022 13:14:15 +0000");
  });
});
