export type SectionStatus = "ok" | "partial" | "error";

export interface SectionState<T> {
  status: SectionStatus;
  data: T | null;
  error?: string;
  note?: string;
}

export interface MarketSnapshot {
  currentPrice: number;
  marketCap: number;
  totalVolume: number;
  circulatingSupply: number;
  maxSupply: number;
  priceChange24h: number;
  priceChange7d: number;
  priceChange30d: number;
  ath: number;
  athDate: string;
  distanceFromAth: number;
  lastUpdated: string;
}

export interface PricePoint {
  timestamp: number;
  price: number;
  marketCap: number;
  totalVolume: number;
  drawdown: number;
}

export interface HalvingMarker {
  label: string;
  date: string;
  reward: number;
  blockHeight: number;
  estimated?: boolean;
  priceAtDate: number | null;
}

export interface PriceHistoryPayload {
  points: PricePoint[];
  halvingMarkers: HalvingMarker[];
  returns: {
    thirtyDay: number | null;
    ninetyDay: number | null;
    oneYear: number | null;
  };
}

export interface HashratePoint {
  timestamp: number;
  value: number;
}

export interface FeePoint {
  timestamp: number;
  value: number;
}

export interface RecommendedFees {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
}

export interface NetworkSnapshot {
  hashrate: HashratePoint[];
  transactionFees: FeePoint[];
  currentHashrate: number | null;
  hashrateChange1y: number | null;
  avgDailyFees: number | null;
  recommendedFees: RecommendedFees | null;
  difficultyChange: number | null;
  remainingBlocks: number | null;
  nextRetargetDate: string | null;
  notes: string[];
}

export interface DrawdownPoint {
  timestamp: number;
  value: number;
}

export interface DrawdownPayload {
  points: DrawdownPoint[];
  currentDrawdown: number | null;
  cycleLowDrawdown: number | null;
  maxDrawdown: number | null;
}

export interface HalvingContext {
  events: HalvingMarker[];
  cycleProgress: number;
  daysSinceLastHalving: number;
  daysUntilNextHalving: number;
  currentReward: number;
}

export interface SupplySnapshot {
  circulatingSupply: number;
  maxSupply: number;
  minedPercent: number;
  remainingSupply: number;
  daysUntilNextHalving: number;
  currentReward: number;
  issuanceEra: string;
}

export interface DashboardData {
  generatedAt: string;
  market: SectionState<MarketSnapshot>;
  priceHistory: SectionState<PriceHistoryPayload>;
  network: SectionState<NetworkSnapshot>;
  drawdown: SectionState<DrawdownPayload>;
  halving: SectionState<HalvingContext>;
  supply: SectionState<SupplySnapshot>;
}
