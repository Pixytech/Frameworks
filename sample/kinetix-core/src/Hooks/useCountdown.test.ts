import { renderHook, act } from "@testing-library/react";
import { useCountdown } from "./useCountdown";

jest.setTimeout(10000);
// Mock Date to control time in tests
const MOCK_DATE = new Date().getTime();

describe("Kinetix Core", () => {
  it("should handle past target date", () => {
    const targetDate = new Date(MOCK_DATE - 10000); // 10 seconds ago

    const { result } = renderHook(() => useCountdown(targetDate));

    // Countdown should be zero,if target date is in the past
    expect(result.current).toEqual([0, 0, 0, 0]);
  });
});
