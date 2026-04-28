export type FormPerformanceMetric = "typing_p95_ms" | "submit_p95_ms" | "jank_ratio";

export type FormPerformanceBudget = {
  typing_p95_ms: number;
  submit_p95_ms: number;
  jank_ratio: number;
};

export const FORM_PERFORMANCE_BUDGET: FormPerformanceBudget = {
  typing_p95_ms: 120,
  submit_p95_ms: 1800,
  jank_ratio: 0.08,
};

export const calcPercentile = (samples: number[], percentile: number): number => {
  if (samples.length === 0) return 0;
  const sorted = [...samples].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((percentile / 100) * sorted.length) - 1)
  );
  return sorted[index];
};

export const evaluateBudget = (
  metric: FormPerformanceMetric,
  value: number,
  budget: FormPerformanceBudget = FORM_PERFORMANCE_BUDGET
) => ({
  metric,
  value,
  limit: budget[metric],
  exceeded: value > budget[metric],
});

// ─── Frame jank detector ─────────────────────────────────────────────────────

const FRAME_BUDGET_MS = 24; // ~42 fps threshold (target 60 fps = 16.6 ms)

export class FormPerformanceSampler {
  private typingSamples: number[] = [];
  private lastTypingTs: number | null = null;
  private jankFrames = 0;
  private totalFrames = 0;
  private frameHandle: ReturnType<typeof requestAnimationFrame> | null = null;
  private prevFrameTs: number | null = null;

  startFrameTracking() {
    if (this.frameHandle !== null) return;

    const tick = (ts: number) => {
      if (this.prevFrameTs !== null) {
        const delta = ts - this.prevFrameTs;
        this.totalFrames++;
        if (delta > FRAME_BUDGET_MS) this.jankFrames++;
      }
      this.prevFrameTs = ts;
      this.frameHandle = requestAnimationFrame(tick);
    };
    this.frameHandle = requestAnimationFrame(tick);
  }

  stopFrameTracking() {
    if (this.frameHandle !== null) {
      cancelAnimationFrame(this.frameHandle);
      this.frameHandle = null;
    }
    this.prevFrameTs = null;
  }

  recordTypingEvent() {
    const now = Date.now();
    if (this.lastTypingTs !== null) {
      this.typingSamples.push(now - this.lastTypingTs);
      // Keep only the last 100 samples to avoid unbounded growth
      if (this.typingSamples.length > 100) this.typingSamples.shift();
    }
    this.lastTypingTs = now;
  }

  report(submitMs: number, budget = FORM_PERFORMANCE_BUDGET) {
    const typingP95 = calcPercentile(this.typingSamples, 95);
    const jankRatio =
      this.totalFrames > 0 ? this.jankFrames / this.totalFrames : 0;

    const results = {
      typing_p95_ms: evaluateBudget("typing_p95_ms", typingP95, budget),
      submit_p95_ms: evaluateBudget("submit_p95_ms", submitMs, budget),
      jank_ratio: evaluateBudget("jank_ratio", jankRatio, budget),
    };

    if (__DEV__) {
      const exceeded = Object.values(results).filter((r) => r.exceeded);
      if (exceeded.length > 0) {
        console.warn(
          "[DynamicForm] ⚠️ Performance budget exceeded:",
          exceeded.map((r) => `${r.metric}: ${r.value.toFixed(1)} > ${r.limit}`).join(", ")
        );
      } else {
        console.log(
          "[DynamicForm] ✅ Performance OK —",
          `typing p95: ${typingP95.toFixed(0)}ms,`,
          `submit: ${submitMs.toFixed(0)}ms,`,
          `jank: ${(jankRatio * 100).toFixed(1)}%`
        );
      }
    }

    return results;
  }

  reset() {
    this.typingSamples = [];
    this.lastTypingTs = null;
    this.jankFrames = 0;
    this.totalFrames = 0;
  }
}
