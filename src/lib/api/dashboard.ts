import {
  BTC_MAX_SUPPLY,
  CURRENT_BLOCK_REWARD,
  DASHBOARD_CACHE_TTL_MS,
  HALVING_EVENTS
} from "@/lib/constants/bitcoin";
import {
  fetchCirculatingSupplyHistory,
  fetchHashrateHistory,
  fetchMarketPriceHistory,
  fetchTradeVolumeHistory,
  fetchTransactionFeeHistory
} from "@/lib/api/blockchain";
import { fetchDifficultyAdjustment, fetchRecommendedFees } from "@/lib/api/mempool";
import type {
  DashboardData,
  DrawdownPayload,
  HalvingContext,
  HalvingMarker,
  NetworkSnapshot,
  PriceHistoryPayload,
  PricePoint,
  SectionState,
  SupplySnapshot
} from "@/lib/types/dashboard";

let dashboardCache: {
  expiresAt: number;
  value: DashboardData | null;
} = {
  expiresAt: 0,
  value: null
};

function ok<T>(data: T, note?: string): SectionState<T> {
  return {
    status: "ok",
    data,
    note
  };
}

function partial<T>(data: T, note: string): SectionState<T> {
  return {
    status: "partial",
    data,
    note
  };
}

function errorState<T>(message: string): SectionState<T> {
  return {
    status: "error",
    data: null,
    error: message
  };
}

function latestValue<T extends { timestamp: number }>(series: T[]) {
  return [...series].sort((left, right) => left.timestamp - right.timestamp).at(-1) ?? null;
}

function findValueAtOrBefore<T extends { timestamp: number }>(series: T[], timestamp: number) {
  let candidate: T | null = null;

  for (const point of series) {
    if (point.timestamp <= timestamp) {
      candidate = point;
    } else {
      break;
    }
  }

  return candidate;
}

function findClosestPoint(points: PricePoint[], date: string) {
  const target = new Date(date).getTime();
  let closest: PricePoint | null = null;
  let smallestDistance = Number.POSITIVE_INFINITY;

  for (const point of points) {
    const distance = Math.abs(point.timestamp - target);

    if (distance < smallestDistance) {
      smallestDistance = distance;
      closest = point;
    }
  }

  return closest;
}

function calculateReturn(points: PricePoint[], days: number) {
  if (points.length === 0) {
    return null;
  }

  const latest = points.at(-1);

  if (!latest) {
    return null;
  }

  const targetTime = latest.timestamp - days * 24 * 60 * 60 * 1000;
  let baseline: PricePoint | null = null;

  for (let index = points.length - 1; index >= 0; index -= 1) {
    if (points[index]!.timestamp <= targetTime) {
      baseline = points[index]!;
      break;
    }
  }

  if (!baseline || baseline.price === 0) {
    return null;
  }

  return ((latest.price / baseline.price) - 1) * 100;
}

function addDrawdowns(points: PricePoint[]) {
  let runningPeak = 0;

  return points.map((point) => {
    runningPeak = Math.max(runningPeak, point.price);
    const drawdown = runningPeak === 0 ? 0 : ((point.price / runningPeak) - 1) * 100;

    return {
      ...point,
      drawdown
    };
  });
}

function buildHalvingMarkers(points: PricePoint[]): HalvingMarker[] {
  return HALVING_EVENTS.map((event) => ({
    ...event,
    priceAtDate: event.estimated ? null : findClosestPoint(points, event.date)?.price ?? null
  }));
}

function buildPriceHistory(points: PricePoint[]): PriceHistoryPayload {
  return {
    points,
    halvingMarkers: buildHalvingMarkers(points),
    returns: {
      thirtyDay: calculateReturn(points, 30),
      ninetyDay: calculateReturn(points, 90),
      oneYear: calculateReturn(points, 365)
    }
  };
}

function getCycleDrawdownLow(points: PricePoint[]) {
  const currentCycle = HALVING_EVENTS.at(-2);

  if (!currentCycle) {
    return null;
  }

  const cycleStart = new Date(currentCycle.date).getTime();
  const cyclePoints = points.filter((point) => point.timestamp >= cycleStart);

  if (cyclePoints.length === 0) {
    return null;
  }

  return Math.min(...cyclePoints.map((point) => point.drawdown));
}

function buildDrawdown(points: PricePoint[]): DrawdownPayload {
  return {
    points: points.map((point) => ({
      timestamp: point.timestamp,
      value: point.drawdown
    })),
    currentDrawdown: points.at(-1)?.drawdown ?? null,
    cycleLowDrawdown: getCycleDrawdownLow(points),
    maxDrawdown: points.length > 0 ? Math.min(...points.map((point) => point.drawdown)) : null
  };
}

function buildHalvingContext(points: PricePoint[]): HalvingContext {
  const markers = buildHalvingMarkers(points);
  const now = Date.now();

  const pastEvents = HALVING_EVENTS.filter((event) => new Date(event.date).getTime() <= now);
  const nextEvent =
    HALVING_EVENTS.find((event) => new Date(event.date).getTime() > now) ?? HALVING_EVENTS.at(-1)!;
  const lastEvent = pastEvents.at(-1) ?? HALVING_EVENTS[0];
  const lastTimestamp = new Date(lastEvent.date).getTime();
  const nextTimestamp = new Date(nextEvent.date).getTime();
  const cycleSpan = Math.max(nextTimestamp - lastTimestamp, 1);
  const cycleProgress = Math.min(Math.max(((now - lastTimestamp) / cycleSpan) * 100, 0), 100);
  const daysSinceLastHalving = (now - lastTimestamp) / (24 * 60 * 60 * 1000);
  const daysUntilNextHalving = Math.max((nextTimestamp - now) / (24 * 60 * 60 * 1000), 0);

  return {
    events: markers,
    cycleProgress,
    daysSinceLastHalving,
    daysUntilNextHalving,
    currentReward: lastEvent.reward ?? CURRENT_BLOCK_REWARD
  };
}

function buildSupplySnapshot(circulatingSupply: number, halving: HalvingContext): SupplySnapshot {
  const remainingSupply = Math.max(BTC_MAX_SUPPLY - circulatingSupply, 0);
  const minedPercent = (circulatingSupply / BTC_MAX_SUPPLY) * 100;
  const issuanceEra = halving.currentReward <= 3.125 ? "Late scarcity era" : "Mid-cycle issuance era";

  return {
    circulatingSupply,
    maxSupply: BTC_MAX_SUPPLY,
    minedPercent,
    remainingSupply,
    daysUntilNextHalving: halving.daysUntilNextHalving,
    currentReward: halving.currentReward,
    issuanceEra
  };
}

function buildMarketSnapshot(
  prices: PricePoint[],
  supplySeries: Array<{ timestamp: number; value: number }>,
  volumeSeries: Array<{ timestamp: number; value: number }>
) {
  const orderedPrices = [...prices].sort((left, right) => left.timestamp - right.timestamp);
  const latestPrice = orderedPrices.at(-1);
  const yesterdayPrice = orderedPrices.at(-2);

  if (!latestPrice) {
    throw new Error("Price history is required to build the market snapshot.");
  }

  const latestTimestamp = latestPrice.timestamp;
  const sevenDayPoint = findValueAtOrBefore(orderedPrices, latestTimestamp - 7 * 24 * 60 * 60 * 1000);
  const thirtyDayPoint = findValueAtOrBefore(orderedPrices, latestTimestamp - 30 * 24 * 60 * 60 * 1000);
  const latestSupply = latestValue(supplySeries);
  const latestVolume = latestValue(volumeSeries);
  const athPoint = orderedPrices.reduce((best, point) => (point.price > best.price ? point : best), orderedPrices[0]!);

  const circulatingSupply = latestSupply?.value ?? 0;
  const marketCap = latestPrice.price * circulatingSupply;

  return {
    currentPrice: latestPrice.price,
    marketCap,
    totalVolume: latestVolume?.value ?? latestPrice.totalVolume ?? 0,
    circulatingSupply,
    maxSupply: BTC_MAX_SUPPLY,
    priceChange24h:
      yesterdayPrice && yesterdayPrice.price !== 0 ? ((latestPrice.price / yesterdayPrice.price) - 1) * 100 : 0,
    priceChange7d:
      sevenDayPoint && sevenDayPoint.price !== 0 ? ((latestPrice.price / sevenDayPoint.price) - 1) * 100 : 0,
    priceChange30d:
      thirtyDayPoint && thirtyDayPoint.price !== 0 ? ((latestPrice.price / thirtyDayPoint.price) - 1) * 100 : 0,
    ath: athPoint.price,
    athDate: new Date(athPoint.timestamp).toISOString(),
    distanceFromAth: athPoint.price === 0 ? 0 : ((latestPrice.price / athPoint.price) - 1) * 100,
    lastUpdated: new Date(latestTimestamp).toISOString()
  };
}

async function loadNetworkSection(): Promise<SectionState<NetworkSnapshot>> {
  const [hashrateResult, feeHistoryResult, feesResult, difficultyResult] = await Promise.allSettled([
    fetchHashrateHistory(),
    fetchTransactionFeeHistory(),
    fetchRecommendedFees(),
    fetchDifficultyAdjustment()
  ]);

  const notes: string[] = [];
  const hashrate = hashrateResult.status === "fulfilled" ? hashrateResult.value : [];
  const transactionFees = feeHistoryResult.status === "fulfilled" ? feeHistoryResult.value : [];
  const recommendedFees = feesResult.status === "fulfilled" ? feesResult.value : null;
  const difficulty = difficultyResult.status === "fulfilled" ? difficultyResult.value : null;

  if (hashrateResult.status === "rejected") {
    notes.push("Hashrate history is temporarily unavailable.");
  }

  if (feeHistoryResult.status === "rejected") {
    notes.push("Historical fee totals are temporarily unavailable.");
  }

  if (feesResult.status === "rejected") {
    notes.push("Live fee recommendations are temporarily unavailable.");
  }

  if (difficultyResult.status === "rejected") {
    notes.push("Difficulty retarget context is temporarily unavailable.");
  }

  if (notes.length === 4) {
    return errorState("Network sources are temporarily unavailable.");
  }

  const currentHashrate = hashrate.at(-1)?.value ?? null;
  const firstHashrate = hashrate[0]?.value ?? null;
  const hashrateChange1y =
    currentHashrate !== null && firstHashrate !== null && firstHashrate !== 0
      ? ((currentHashrate / firstHashrate) - 1) * 100
      : null;
  const avgDailyFees = transactionFees.at(-1)?.value ?? null;
  const estimatedRetargetDate = difficulty?.estimatedRetargetDate
    ? difficulty.estimatedRetargetDate > 1_000_000_000_000
      ? difficulty.estimatedRetargetDate
      : difficulty.estimatedRetargetDate * 1000
    : null;

  const data: NetworkSnapshot = {
    hashrate,
    transactionFees,
    currentHashrate,
    hashrateChange1y,
    avgDailyFees,
    recommendedFees,
    difficultyChange: difficulty?.difficultyChange ?? null,
    remainingBlocks: difficulty?.remainingBlocks ?? null,
    nextRetargetDate: estimatedRetargetDate ? new Date(estimatedRetargetDate).toISOString() : null,
    notes
  };

  return notes.length > 0 ? partial(data, notes.join(" ")) : ok(data);
}

async function buildDashboardData(): Promise<DashboardData> {
  const [priceResult, supplyResult, volumeResult, network] = await Promise.allSettled([
    fetchMarketPriceHistory(),
    fetchCirculatingSupplyHistory(),
    fetchTradeVolumeHistory(),
    loadNetworkSection()
  ]);

  const marketError = "Public market chart data is temporarily unavailable.";
  const historyError = "Historical BTC price data is temporarily unavailable.";
  const priceHistoryPoints = priceResult.status === "fulfilled" ? priceResult.value : null;
  const supplySeries = supplyResult.status === "fulfilled" ? supplyResult.value : [];
  const volumeSeries = volumeResult.status === "fulfilled" ? volumeResult.value : [];

  const market =
    priceHistoryPoints && supplyResult.status === "fulfilled"
      ? ok(buildMarketSnapshot(priceHistoryPoints, supplySeries, volumeSeries))
      : priceHistoryPoints
        ? partial(
            buildMarketSnapshot(priceHistoryPoints, supplySeries, volumeSeries),
            "Supply or volume chart data is partially unavailable, so some market snapshot values are derived from the price series alone."
          )
        : errorState(marketError);

  let priceHistory: SectionState<PriceHistoryPayload> = errorState(
    historyError
  );
  let drawdown: SectionState<DrawdownPayload> = errorState("Drawdown analysis needs historical price data.");
  let halving: SectionState<HalvingContext> = partial(
    buildHalvingContext([]),
    "Halving dates remain available even when historical price context is missing."
  );
  let supply: SectionState<SupplySnapshot> = errorState("Supply progress needs a current circulating supply reading.");

  if (priceHistoryPoints) {
    const pricePoints = addDrawdowns(priceHistoryPoints);
    priceHistory = ok(buildPriceHistory(pricePoints));
    drawdown = ok(buildDrawdown(pricePoints));
    halving = ok(buildHalvingContext(pricePoints));

    if (market.data) {
      supply = ok(buildSupplySnapshot(market.data.circulatingSupply, halving.data));
    }
  } else if (market.data) {
    const halvingContext = buildHalvingContext([]);
    halving = partial(
      halvingContext,
      "Halving milestones are shown without historical price annotations because price history could not be loaded."
    );
    supply = ok(buildSupplySnapshot(market.data.circulatingSupply, halvingContext));
  }

  const networkState =
    network.status === "fulfilled" ? network.value : errorState<NetworkSnapshot>("Network metrics are unavailable.");

  return {
    generatedAt: new Date().toISOString(),
    market,
    priceHistory,
    network: networkState,
    drawdown,
    halving,
    supply
  };
}

export async function getDashboardData() {
  const now = Date.now();

  if (dashboardCache.value && dashboardCache.expiresAt > now) {
    return dashboardCache.value;
  }

  const value = await buildDashboardData();
  dashboardCache = {
    value,
    expiresAt: now + DASHBOARD_CACHE_TTL_MS
  };

  return value;
}
