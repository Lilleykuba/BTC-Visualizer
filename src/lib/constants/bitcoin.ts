export const BTC_MAX_SUPPLY = 21_000_000;
export const CURRENT_BLOCK_REWARD = 3.125;
export const DASHBOARD_CACHE_TTL_MS = 5 * 60 * 1000;

export const TIMEFRAME_OPTIONS = [
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
  { label: "1Y", value: 365 },
  { label: "4Y", value: 1460 },
  { label: "All", value: "max" as const }
] as const;

export const HALVING_EVENTS = [
  {
    label: "1st halving",
    date: "2012-11-28",
    blockHeight: 210_000,
    reward: 25
  },
  {
    label: "2nd halving",
    date: "2016-07-09",
    blockHeight: 420_000,
    reward: 12.5
  },
  {
    label: "3rd halving",
    date: "2020-05-11",
    blockHeight: 630_000,
    reward: 6.25
  },
  {
    label: "4th halving",
    date: "2024-04-20",
    blockHeight: 840_000,
    reward: 3.125
  },
  {
    label: "5th halving",
    date: "2028-04-17",
    blockHeight: 1_050_000,
    reward: 1.5625,
    estimated: true
  }
] as const;
