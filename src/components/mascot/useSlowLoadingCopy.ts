"use client";

import { useEffect, useState } from "react";

const SLOW_THRESHOLD_MS = 4000;
const ROTATE_INTERVAL_MS = 2000;

interface Options {
  visible: boolean;
  defaultTitle: string;
  defaultSubtitle: string;
  slowTitle: string;
  slowSteps: [string, string, string];
}

export function useSlowLoadingCopy({
  visible,
  defaultTitle,
  defaultSubtitle,
  slowTitle,
  slowSteps,
}: Options) {
  const [elapsed, setElapsed] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!visible) return;

    const start = Date.now();
    const reset = window.requestAnimationFrame(() => {
      setElapsed(0);
      setStepIndex(0);
    });
    const tick = setInterval(() => {
      setElapsed(Date.now() - start);
    }, 100);

    return () => {
      window.cancelAnimationFrame(reset);
      clearInterval(tick);
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || elapsed <= SLOW_THRESHOLD_MS) return;

    const rotate = setInterval(() => {
      setStepIndex((i) => (i + 1) % slowSteps.length);
    }, ROTATE_INTERVAL_MS);

    return () => clearInterval(rotate);
  }, [visible, elapsed, slowSteps.length]);

  const isSlow = visible && elapsed > SLOW_THRESHOLD_MS;

  return {
    title: isSlow ? slowTitle : defaultTitle,
    subtitle: isSlow ? slowSteps[stepIndex] : defaultSubtitle,
    isSlow,
  };
}
