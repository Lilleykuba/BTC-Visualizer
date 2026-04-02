import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { TIMEFRAME_OPTIONS } from "@/lib/constants/bitcoin";
import { formatAxisDate, formatCurrency, formatCurrencyShort } from "@/lib/formatters";
import type { HalvingMarker, PricePoint } from "@/lib/types/dashboard";

type Timeframe = number | "max";

interface Props {
  points: PricePoint[];
  halvingMarkers: HalvingMarker[];
}

interface TooltipPayload {
  value: number;
  payload: PricePoint;
}

interface BasicTooltipProps {
  active?: boolean;
  label?: number;
  payload?: TooltipPayload[];
}

function filterPoints(points: PricePoint[], timeframe: Timeframe) {
  if (timeframe === "max" || points.length === 0) {
    return points;
  }

  const latest = points.at(-1);

  if (!latest) {
    return points;
  }

  const cutoff = latest.timestamp - timeframe * 24 * 60 * 60 * 1000;
  return points.filter((point) => point.timestamp >= cutoff);
}

function PriceTooltip({ active, label, payload }: BasicTooltipProps) {
  if (!active || !payload?.length || label === undefined) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-line/70 bg-surface px-4 py-3 shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{formatAxisDate(label)}</p>
      <p className="mt-2 text-lg font-semibold text-ink">{formatCurrency(payload[0]?.value, 0)}</p>
      <p className="mt-1 text-xs text-muted">BTC spot price</p>
    </div>
  );
}

export default function PriceHistoryChart({ points, halvingMarkers }: Props) {
  const [timeframe, setTimeframe] = useState<Timeframe>(365);
  const filteredPoints = filterPoints(points, timeframe);
  const start = filteredPoints[0]?.timestamp ?? 0;
  const end = filteredPoints.at(-1)?.timestamp ?? 0;
  const visibleMarkers = halvingMarkers.filter((marker) => {
    const timestamp = new Date(marker.date).getTime();
    return timestamp >= start && timestamp <= end;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {TIMEFRAME_OPTIONS.map((option) => {
          const active = option.value === timeframe;

          return (
            <button
              key={option.label}
              type="button"
              onClick={() => setTimeframe(option.value)}
              className={`rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-ink text-white"
                  : "border border-line/70 bg-surface-alt/70 text-muted hover:border-accent/40 hover:text-ink"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredPoints} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="price-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgb(213, 156, 71)" stopOpacity={0.32} />
                <stop offset="95%" stopColor="rgb(213, 156, 71)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(216, 208, 195, 0.55)" vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatAxisDate}
              tick={{ fill: "rgb(101, 105, 111)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              minTickGap={28}
            />
            <YAxis
              tickFormatter={formatCurrencyShort}
              tick={{ fill: "rgb(101, 105, 111)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip content={<PriceTooltip />} />
            {visibleMarkers.map((marker) => (
              <ReferenceLine
                key={marker.date}
                x={new Date(marker.date).getTime()}
                stroke="rgba(98, 141, 173, 0.45)"
                strokeDasharray="4 4"
              />
            ))}
            <Area
              type="monotone"
              dataKey="price"
              stroke="rgb(185, 126, 39)"
              strokeWidth={2.25}
              fill="url(#price-fill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
