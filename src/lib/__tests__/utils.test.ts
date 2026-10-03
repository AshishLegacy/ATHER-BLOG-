import { describe, it, expect } from "vitest";
import {
  slugify,
  calculateReadingTime,
  stripHtml,
  truncateText,
  formatDate,
} from "../utils";

describe("Utils Library", () => {
  it("generates correct URL slugs", () => {
    expect(slugify("Mastering Next.js 15 & React 19!")).toBe(
      "mastering-nextjs-15-and-react-19"
    );
    expect(slugify("  Hello   World  ---  ")).toBe("hello-world");
    expect(slugify("Special #$@ Characters 2026")).toBe(
      "special-characters-2026"
    );
  });

  it("calculates accurate reading time", () => {
    const shortText = "This is a short post with a few words.";
    expect(calculateReadingTime(shortText)).toBe(1);

    const longWords = new Array(450).fill("word").join(" ");
    expect(calculateReadingTime(longWords)).toBe(3); // 450 words / 200 wpm = 2.25 -> 3 mins
  });

  it("strips HTML tags cleanly", () => {
    const html = "<p>Hello <strong>World</strong> <a href='#'>Link</a></p>";
    expect(stripHtml(html)).toBe("Hello World Link");
  });

  it("truncates text without breaking words", () => {
    const text = "This is a long text that needs to be truncated cleanly.";
    expect(truncateText(text, 20)).toBe("This is a long text...");
  });

  it("formats dates gracefully", () => {
    const date = new Date("2026-05-15T12:00:00Z");
    expect(formatDate(date)).toContain("May");
    expect(formatDate(null)).toBe("");
  });
});
