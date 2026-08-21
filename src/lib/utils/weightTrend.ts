import type { WeightLogEntry, WeightTrendPoint } from "@/lib/types";

/**
 * Computes a 7-day Exponential Moving Average over a chronologically-sorted
 * series of weight logs, to smooth daily water-weight noise.
 *
 * alpha = 2 / (N + 1) with N = 7, the standard EMA smoothing constant.
 * Days with no logged weight are skipped (not interpolated), so the EMA
 * only advances on days that have an actual entry.
 */
const EMA_WINDOW = 7;
const ALPHA = 2 / (EMA_WINDOW + 1);

export function computeEma(logs: WeightLogEntry[]): Map<string, number> {
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const emaByDate = new Map<string, number>();

  let prevEma: number | null = null;
  for (const log of sorted) {
    const ema: number = prevEma === null ? log.weightKg : ALPHA * log.weightKg + (1 - ALPHA) * prevEma;
    emaByDate.set(log.date, ema);
    prevEma = ema;
  }

  return emaByDate;
}

/**
 * Builds the full chart series: actual logged weight, the smoothed EMA, and
 * a linear projection from today's EMA toward the target weight/date.
 */
export function buildWeightTrend(
  logs: WeightLogEntry[],
  targetWeightKg: number,
  targetDate?: string,
): WeightTrendPoint[] {
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const emaByDate = computeEma(sorted);

  const points: WeightTrendPoint[] = sorted.map((log) => ({
    date: log.date,
    actualWeightKg: log.weightKg,
    emaWeightKg: emaByDate.get(log.date) ?? null,
    projectedWeightKg: null,
  }));

  if (targetDate && sorted.length > 0) {
    const lastPoint = sorted[sorted.length - 1];
    const lastEma = emaByDate.get(lastPoint.date) ?? lastPoint.weightKg;
    const startDate = new Date(lastPoint.date);
    const endDate = new Date(targetDate);
    const totalDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000));

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + day);
      const progress = day / totalDays;
      const projectedWeightKg = lastEma + (targetWeightKg - lastEma) * progress;
      points.push({
        date: date.toISOString().slice(0, 10),
        actualWeightKg: null,
        emaWeightKg: null,
        projectedWeightKg,
      });
    }
  }

  return points;
}
