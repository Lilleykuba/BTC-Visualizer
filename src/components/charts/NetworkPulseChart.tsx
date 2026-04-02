import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatAxisDate, formatBtc, formatHashrateEh } from "@/lib/formatters";
import type { FeePoint, HashratePoint } from "@/lib/types/dashboard";

interface Props {
  hashrate: HashratePoint[];
  transactionFees: FeePoint[];
}

type View = "hashrate" | "fees";

interface TooltipPayload {
  value: number;
}

interface BasicTooltipProps {
  active?: boolean;
  label?: number;
  payload?: TooltipPayload[];
}

function NetworkTooltip({ active, label, payload, view }: BasicTooltipProps & { view: View }) {
  if (!active || !payload?.length || label === undefined) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-line/70 bg-surface px-4 py-3 shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{formatAxisDate(label)}</p>
      <p className="mt-2 text-lg font-semibold text-ink">
        {view === "hashrate" ? formatHashrateEh(payload[0]?.value) : formatBtc(payload[0]?.value)}
      </p>
      <p className="mt-1 text-xs text-muted">
        {view === "hashrate" ? "Estimated total network hashrate" : "Total transaction fees paid that day"}
      </p>
    </div>
  );
}

export default function NetworkPulseChart({ hashrate, transactionFees }: Props) {
  const defaultView: View = hashrate.length > 0 ? "hashrate" : "fees";
  const [view, setView] = useState<View>(defaultView);
  const data = view === "hashrate" ? hashrate : transactionFees;
  const stroke = view === "hashrate" ? "rgb(98, 141, 173)" : "rgb(80, 140, 128)";
  const fill = view === "hashrate" ? "rgba(98, 141, 173, 0.25)" : "rgba(80, 140, 128, 0.25)";

  if (data.length === 0) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-[1.75rem] border border-dashed border-line/70 bg-surface-alt/35 text-sm text-muted">
        Network history is temporarily unavailable.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {hashrate.length > 0 && (
          <button
            type="button"
            onClick={() => setView("hashrate")}
            className={`rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
              view === "hashrate"
                ? "bg-ink text-white"
                : "border border-line/70 bg-surface-alt/70 text-muted hover:text-ink"
            }`}
          >
            Hashrate
          </button>
        )}
        {transactionFees.length > 0 && (
          <button
            type="button"
            onClick={() => setView("fees")}
            className={`rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
              view === "fees"
                ? "bg-ink text-white"
                : "border border-line/70 bg-surface-alt/70 text-muted hover:text-ink"
            }`}
          >
            Fees
          </button>
        )}
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="network-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={fill} stopOpacity={0.8} />
                <stop offset="95%" stopColor={fill} stopOpacity={0.05} />
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
              tickFormatter={view === "hashrate" ? formatHashrateEh : formatBtc}
              tick={{ fill: "rgb(101, 105, 111)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={84}
            />
            <Tooltip content={<NetworkTooltip view={view} />} />
            <Area type="monotone" dataKey="value" stroke={stroke} strokeWidth={2.25} fill="url(#network-fill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
