import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSlowLoadingCopy } from "@/components/mascot/useSlowLoadingCopy";

const base = {
  visible: true,
  defaultTitle: "Default title",
  defaultSubtitle: "Default subtitle",
  slowTitle: "Slow title",
  slowSteps: ["Step 1", "Step 2", "Step 3"] as [string, string, string],
};

describe("useSlowLoadingCopy", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows default copy before slow threshold", () => {
    const { result } = renderHook(() => useSlowLoadingCopy(base));

    expect(result.current.title).toBe("Default title");
    expect(result.current.subtitle).toBe("Default subtitle");
    expect(result.current.isSlow).toBe(false);
  });

  it("switches to slow copy after 4 seconds", () => {
    const { result } = renderHook(() => useSlowLoadingCopy(base));

    act(() => {
      vi.advanceTimersByTime(4100);
    });

    expect(result.current.isSlow).toBe(true);
    expect(result.current.title).toBe("Slow title");
    expect(result.current.subtitle).toBe("Step 1");
  });

  it("rotates slow steps every 2 seconds", () => {
    const { result } = renderHook(() => useSlowLoadingCopy(base));

    act(() => {
      vi.advanceTimersByTime(4100);
    });
    expect(result.current.subtitle).toBe("Step 1");

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.subtitle).toBe("Step 2");

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.subtitle).toBe("Step 3");
  });

  it("resets when visibility turns off", () => {
    const { result, rerender } = renderHook(
      ({ visible }: { visible: boolean }) =>
        useSlowLoadingCopy({ ...base, visible }),
      { initialProps: { visible: true } },
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.isSlow).toBe(true);

    rerender({ visible: false });

    expect(result.current.title).toBe("Default title");
    expect(result.current.isSlow).toBe(false);
  });
});
