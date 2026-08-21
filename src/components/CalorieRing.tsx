"use client";

interface CalorieRingProps {
  label: string;
  consumed: number;
  target: number;
  unit?: string;
  colorClass?: string;
}

/** A single circular progress ring for calories or a macro nutrient. */
export default function CalorieRing({
  label,
  consumed,
  target,
  unit = "",
  colorClass = "text-brand-500",
}: CalorieRingProps) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progress = target > 0 ? Math.min(consumed / target, 1) : 0;
  const offset = circumference * (1 - progress);
  const remaining = Math.max(target - consumed, 0);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-[100px] w-[100px]">
        <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
          <circle cx="50" cy="50" r={radius} strokeWidth="8" className="fill-none stroke-slate-100" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`fill-none transition-all duration-500 ${colorClass}`}
            stroke="currentColor"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold">{Math.round(consumed)}</span>
          <span className="text-[10px] text-slate-400">of {Math.round(target)}{unit}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="text-[10px] text-slate-400">{Math.round(remaining)}{unit} left</span>
    </div>
  );
}
