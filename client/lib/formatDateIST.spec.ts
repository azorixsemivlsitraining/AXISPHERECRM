import { describe, it, expect } from "vitest";
import {
  formatDateIST,
  formatActivityLogDate,
  formatDateOnlyIST,
  formatRelativeTime,
} from "./formatDateIST";

describe("formatDateIST - IST Timezone Conversion", () => {
  it("should format date string to IST timezone with datetime", () => {
    // UTC date: 2024-01-15T10:00:00Z
    // IST (UTC+5:30): 2024-01-15T15:30:00
    const utcDate = "2024-01-15T10:00:00Z";
    const result = formatDateIST(utcDate, "datetime");

    // Should contain the date in IST format (DD/MM/YYYY format with en-IN locale)
    expect(result).toContain("15");
    expect(result).toContain("01");
    expect(result).toContain("2024");
    // IST time should be 15:30
    expect(result).toContain("15");
    expect(result).toContain("30");
  });

  it("should format date object to IST timezone", () => {
    const date = new Date("2024-01-15T10:00:00Z");
    const result = formatDateIST(date, "datetime");

    expect(result).toContain("15");
    expect(result).toContain("01");
    expect(result).toContain("2024");
  });

  it("should format date without time component when format is 'date'", () => {
    const utcDate = "2024-01-15T10:00:00Z";
    const result = formatDateIST(utcDate, "date");

    // Should not contain colons (indicating time) in the result
    // Date format should be DD/MM/YYYY
    expect(result).not.toContain(":");
    expect(result).toContain("15");
    expect(result).toContain("01");
    expect(result).toContain("2024");
  });

  it("should handle invalid dates gracefully", () => {
    const invalidDate = "invalid-date-string";
    const result = formatDateIST(invalidDate);

    // Should return the original string for invalid dates
    expect(result).toBe(invalidDate);
  });

  it("should handle Date object creation from ISO string", () => {
    // Testing with a known timezone offset scenario
    // UTC 2024-01-01T00:00:00Z -> IST 2024-01-01T05:30:00
    const utcDate = "2024-01-01T00:00:00Z";
    const result = formatDateIST(utcDate, "datetime");

    expect(result).toContain("01"); // day
    expect(result).toContain("01"); // month
    expect(result).toContain("2024");
    expect(result).toContain("05"); // IST hours (00 UTC + 5:30 = 05:30)
    expect(result).toContain("30"); // IST minutes
  });

  it("should handle afternoon UTC times converting to next day IST", () => {
    // UTC 2024-01-15T22:00:00Z -> IST 2024-01-16T03:30:00 (next day)
    const utcDate = "2024-01-15T22:00:00Z";
    const result = formatDateIST(utcDate, "datetime");

    // In IST, this should be next day (16th)
    expect(result).toContain("16"); // day should be 16th in IST
    expect(result).toContain("2024");
  });
});

describe("formatActivityLogDate", () => {
  it("should format date with time for activity logs", () => {
    const utcDate = "2024-01-15T10:00:00Z";
    const result = formatActivityLogDate(utcDate);

    // Should include both date and time
    expect(result).toContain("15");
    expect(result).toContain("01");
    expect(result).toContain("2024");
    expect(result).toContain("15"); // hours in IST
    expect(result).toContain("30"); // minutes in IST
  });

  it("should handle invalid input", () => {
    const result = formatActivityLogDate("not-a-date");
    expect(result).toBe("not-a-date");
  });
});

describe("formatDateOnlyIST", () => {
  it("should format date without time", () => {
    const utcDate = "2024-01-15T10:00:00Z";
    const result = formatDateOnlyIST(utcDate);

    // Should not contain time
    expect(result).not.toContain(":");
    expect(result).toContain("15");
    expect(result).toContain("01");
    expect(result).toContain("2024");
  });
});

describe("formatRelativeTime", () => {
  it("should return 'just now' for very recent dates", () => {
    const now = new Date();
    const result = formatRelativeTime(now);
    expect(result).toBe("just now");
  });

  it("should return relative time for dates in the past", () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const result = formatRelativeTime(oneHourAgo);

    expect(result).toContain("hour");
  });

  it("should return days for dates more than a week old", () => {
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(eightDaysAgo);

    // Should return formatted date instead of relative time
    expect(result).toContain("/");
  });

  it("should handle invalid input", () => {
    const result = formatRelativeTime("invalid-date");
    expect(result).toBe("Invalid date");
  });
});

describe("Timezone Conversion - Old vs New Notes", () => {
  it("should correctly format notes with old UTC timestamps", () => {
    // Simulating an old note created before any timezone handling
    const oldNoteTimestamp = "2023-06-15T08:30:00Z";
    const formattedDate = formatActivityLogDate(oldNoteTimestamp);

    // Should still convert properly to IST
    // UTC 08:30 + IST offset 5:30 = 14:00 (2:00 PM) IST
    expect(formattedDate).toContain("15");
    expect(formattedDate).toContain("06");
    expect(formattedDate).toContain("2023");
    expect(formattedDate).toContain("02"); // 2 PM format in IST
  });

  it("should correctly format notes with recent UTC timestamps", () => {
    // Simulating a new note created with current timestamp
    const newNoteTimestamp = new Date().toISOString();
    const formattedDate = formatActivityLogDate(newNoteTimestamp);

    // Should be a valid date string
    expect(formattedDate).toBeTruthy();
    expect(formattedDate).not.toBe("Invalid date");
  });

  it("should maintain consistency across multiple formatting calls", () => {
    const timestamp = "2024-01-15T10:00:00Z";
    const format1 = formatActivityLogDate(timestamp);
    const format2 = formatActivityLogDate(timestamp);

    // Should produce identical results
    expect(format1).toBe(format2);
  });

  it("should handle dates without timezone info", () => {
    const dateWithoutTz = "2024-01-15T10:00:00";
    const result = formatActivityLogDate(dateWithoutTz);

    // Should still parse and format
    expect(result).toBeTruthy();
    expect(result).not.toBe("Invalid date");
  });
});
