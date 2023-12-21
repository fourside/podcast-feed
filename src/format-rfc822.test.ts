import { describe, expect, test } from "vitest";
import { formatRfc822 } from "./format-rfc822";

describe(formatRfc822.name, () => {
  test("format", () => {
    // arrange
    const date = new Date(2022, 2, 1, 3, 4, 5);
    // act
    const result = formatRfc822(date);
    // assert
    expect(result).toBe("Tue, 1 Mar 2022 03:04:05 +0000");
  });
});
