import { TimeSpan } from "./TimeSpan";

describe("the TimeSpan class", () => {
  describe("the ctor", () => {
    it("should work without arguments", () => {
      verifyTimeSpan(new TimeSpan(), 0, 0, 0, 0, 0);
    });
    it("should work with (number) arguments", () => {
      verifyTimeSpan(new TimeSpan(999999999999999), 1157, 9, 46, 39, 999);
    });
    it("should work with ([number, number, number]) arguments", () => {
      verifyTimeSpan(new TimeSpan([10, 9, 8]), 0, 10, 9, 8, 0);
    });
    it("should work with ([number, number, number, number]) arguments", () => {
      verifyTimeSpan(new TimeSpan([10, 9, 8, 7]), 10, 9, 8, 7, 0);
    });
    it("should work with ([number, number, number, number, number]) arguments", () => {
      verifyTimeSpan(new TimeSpan([10, 9, 8, 7, 6]), 10, 9, 8, 7, 6);
    });
  });

  describe("the .ticks property", () => {
    it("should work with zero", () => {
      expect(TimeSpan.zero.ticks).toBe(0);
    });
    it("should work with positive ticks", () => {
      expect(new TimeSpan(6).ticks).toBe(6);
    });
    it("should work with negative ticks", () => {
      expect(new TimeSpan(-6).ticks).toBe(-6);
    });
  });

  describe("the .days property", () => {
    it("should work with zero", () => {
      expect(TimeSpan.zero.days).toBe(0);
    });
    it("should work with whole days", () => {
      expect(new TimeSpan([6, 0, 0, 0]).days).toBe(6);
    });
    it("should work with negative days", () => {
      expect(new TimeSpan([-6, 0, 0, 0]).days).toBe(-6);
    });
    it("should round down days", () => {
      expect(new TimeSpan([6, 12, 15, 0]).days).toBe(6);
    });
  });

  describe("the .hours property", () => {
    it("should work with zero", () => {
      expect(TimeSpan.zero.hours).toBe(0);
    });
    it("should work with whole hours", () => {
      expect(new TimeSpan([6, 0, 0]).hours).toBe(6);
    });
    it("should work with negative hours", () => {
      expect(new TimeSpan([-6, 0, 0]).hours).toBe(-6);
    });
    it("should round down hours", () => {
      expect(new TimeSpan([6, 30, 15]).hours).toBe(6);
    });
  });

  describe("the .minutes property", () => {
    it("should work with zero", () => {
      expect(TimeSpan.zero.minutes).toBe(0);
    });
    it("should work with whole minutes", () => {
      expect(new TimeSpan([0, 6, 0]).minutes).toBe(6);
    });
    it("should work with negative minutes", () => {
      expect(new TimeSpan([0, -6, 0]).minutes).toBe(-6);
    });
    it("should round down minutes", () => {
      expect(new TimeSpan([2, 6, 15]).minutes).toBe(6);
    });
  });

  describe("the .seconds property", () => {
    it("should work with zero", () => {
      expect(TimeSpan.zero.seconds).toBe(0);
    });
    it("should work with whole seconds", () => {
      expect(new TimeSpan([0, 0, 6]).seconds).toBe(6);
    });
    it("should work with negative seconds", () => {
      expect(new TimeSpan([0, 0, -6]).seconds).toBe(-6);
    });
    it("should round down seconds", () => {
      expect(new TimeSpan([2, 6, 15, 6, 156]).seconds).toBe(6);
    });
  });

  describe("the .milliseconds property", () => {
    it("should work with zero", () => {
      expect(TimeSpan.zero.milliseconds).toBe(0);
    });
    it("should work with whole milliseconds", () => {
      expect(new TimeSpan([0, 0, 0, 0, 6]).milliseconds).toBe(6);
    });
    it("should work with negative milliseconds", () => {
      expect(new TimeSpan([0, 0, 0, 0, -6]).milliseconds).toBe(-6);
    });
    it("should round down milliseconds", () => {
      expect(new TimeSpan([2, 6, 15, 6, 156]).milliseconds).toBe(156);
    });
  });

  describe("the statis methods", () => {
    it("should work with same date time", () => {
      const ts = TimeSpan.fromDates(new Date(200000), new Date(200000));
      expect(ts.totalMilliseconds).toBe(0);
    });
    it("should work with diff date time", () => {
      const date1 = new Date(200000);
      date1.setMilliseconds(date1.getMilliseconds() + 2);
      const ts = TimeSpan.fromDates(date1, new Date(200000));
      expect(ts.totalMilliseconds).toBe(2);
    });

    it("should work with -ver date time", () => {
      const date1 = new Date(200000);
      date1.setMilliseconds(date1.getMilliseconds() + 2);
      const ts = TimeSpan.fromDates(new Date(200000), date1);
      expect(ts.totalMilliseconds).toBe(2);
    });

    it("should work with fromMilliseconds", () => {
      const ts = TimeSpan.fromMilliseconds(5);
      expect(ts.totalMilliseconds).toBe(5);
    });

    it("should work with fromSeconds", () => {
      const ts = TimeSpan.fromSeconds(5);
      expect(ts.totalSeconds).toBe(5);
    });

    it("should work with fromMinutes", () => {
      const ts = TimeSpan.fromMinutes(5);
      expect(ts.totalMinutes).toBe(5);
    });

    it("should work with fromMinutes", () => {
      const ts = TimeSpan.fromHours(5);
      expect(ts.totalHours).toBe(5);
    });

    it("should work with fromMinutes", () => {
      const ts = TimeSpan.fromDays(5);
      expect(ts.totalDays).toBe(5);
    });

    it("should add", () => {
      const ts1 = TimeSpan.fromDays(5);
      const ts2 = TimeSpan.fromDays(2);
      const ts3 = ts1.add(ts2);
      expect(ts3.totalDays).toBe(7);
    });

    it("should subtract", () => {
      const ts1 = TimeSpan.fromDays(5);
      const ts2 = TimeSpan.fromDays(2);
      const ts3 = ts1.subtract(ts2);
      expect(ts3.totalDays).toBe(3);
    });

    it("should multiple", () => {
      const ts1 = TimeSpan.fromDays(5);
      const ts2 = ts1.multiply(2);
      expect(ts2.totalDays).toBe(10);
    });

    it("should divide timespans", () => {
      const ts1 = new TimeSpan(10);
      const ts2 = new TimeSpan(2);
      const ts3 = ts1.divide(ts2);

      expect(ts3.valueOf()).toBe(5);
    });

    it("should divide number", () => {
      const ts1 = TimeSpan.fromDays(10);
      const ts3 = ts1.divide(2);
      expect(ts3.totalDays).toBe(5);
    });

    it("should return ticks", () => {
      const ts1 = new TimeSpan(10);
      expect(ts1.valueOf()).toBe(10);
    });

    it("should return string", () => {
      expect(TimeSpan.fromDays(9).toString()).toBe("09:00:00:00.000");
      expect(TimeSpan.fromDays(10).toString()).toBe("10:00:00:00.000");

      expect(TimeSpan.fromHours(9).toString()).toBe("00:09:00:00.000");
      expect(TimeSpan.fromHours(10).toString()).toBe("00:10:00:00.000");

      expect(TimeSpan.fromMinutes(9).toString()).toBe("00:00:09:00.000");
      expect(TimeSpan.fromMinutes(10).toString()).toBe("00:00:10:00.000");

      expect(TimeSpan.fromSeconds(10).toString()).toBe("00:00:00:10.000");
      expect(TimeSpan.fromSeconds(9).toString()).toBe("00:00:00:09.000");

      expect(TimeSpan.fromMilliseconds(200).toString()).toBe("00:00:00:00.200");
      expect(TimeSpan.fromMilliseconds(10).toString()).toBe("00:00:00:00.010");
      expect(TimeSpan.fromMilliseconds(9).toString()).toBe("00:00:00:00.009");
    });

    it("should duration timespans+", () => {
      const ts1 = new TimeSpan(10);
      const ts2 = ts1.duration();
      expect(ts2.valueOf()).toBe(10);
    });

    it("should duration timespans -", () => {
      const ts1 = new TimeSpan(-10);
      const ts2 = ts1.duration();
      expect(ts2.valueOf()).toBe(10);
    });

    it("should negatee timespans -", () => {
      const ts1 = new TimeSpan(-10);
      const ts2 = ts1.negate();
      expect(ts2.valueOf()).toBe(10);
    });
  });
});

function verifyTimeSpan(ts: TimeSpan, days: number, hours: number, minutes: number, seconds: number, milliseconds: number) {
  expect(ts.days).toBe(days);
  expect(ts.hours).toBe(hours);
  expect(ts.minutes).toBe(minutes);
  expect(ts.seconds).toBe(seconds);
  expect(ts.milliseconds).toBe(milliseconds);
}
