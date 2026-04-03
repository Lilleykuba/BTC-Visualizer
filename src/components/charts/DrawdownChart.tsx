import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatAxisDate, formatPercent } from "@/lib/formatters";
import type { DrawdownPoint } from "@/lib/types/dashboard";
import { useCompactChart } from "@/components/charts/useCompactChart";

interface Props {
  points: DrawdownPoint[];
}

interface TooltipPayload {
  value: number;
}

interface BasicTooltipProps {
  active?: boolean;
  label?: number;
  payload?: TooltipPayload[];
}

function DrawdownTooltip({ active, label, payload }: BasicTooltipProps) {
  if (!active || !payload?.length || label === undefined) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-line/70 bg-surface px-4 py-3 shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{formatAxisDate(label)}</p>
      <p className="mt-2 text-lg font-semibold text-ink">{formatPercent(payload[0]?.value)}</p>
      <p className="mt-1 text-xs text-muted">Distance from the previous all-time high</p>
    </div>
  );
}

export default function DrawdownChart({ points }: Props) {
  const isCompact = useCompactChart();

  return (
    <div className="h-[280px] w-full sm:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={points}
          margin={{ top: 12, right: isCompact ? 0 : 8, left: isCompact ? -28 : -18, bottom: 0 }}
        >
          <defs>
            <linearGradient id="drawdown-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgba(80, 140, 128, 0.28)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="rgba(80, 140, 128, 0.04)" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(216, 208, 195, 0.55)" vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatAxisDate}
            tick={{ fill: "rgb(101, 105, 111)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            minTickGap={isCompact ? 16 : 28}
          />
          <YAxis
            tickFormatter={formatPercent}
            tick={{ fill: "rgb(101, 105, 111)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={isCompact ? 0 : 76}
            hide={isCompact}
            domain={["dataMin", 0]}
          />
          <Tooltip content={<DrawdownTooltip />} />
          <Area type="monotone" dataKey="value" stroke="rgb(80, 140, 128)" strokeWidth={2.25} fill="url(#drawdown-fill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
