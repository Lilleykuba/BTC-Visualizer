import { z } from "zod";
import type { FeePoint, HashratePoint, PricePoint } from "@/lib/types/dashboard";
import { fetchJson } from "@/lib/api/http";

const chartSchema = z.object({
  values: z.array(
    z.object({
      x: z.number(),
      y: z.number()
    })
  )
});

export async function fetchBlockchainChart(path: string, timespan = "1year", sampled = true) {
  return fetchJson(
    `https://api.blockchain.info/charts/${path}?timespan=${timespan}&sampled=${sampled}&metadata=false&cors=true&format=json`,
    undefined,
    (value) => chartSchema.parse(value)
  );
}

export async function fetchMarketPriceHistory(): Promise<PricePoint[]> {
  const [priceChart, marketCapChart, volumeChart] = await Promise.all([
    fetchBlockchainChart("market-price", "all", true),
    fetchBlockchainChart("market-cap", "all", true),
    fetchBlockchainChart("trade-volume", "all", true)
  ]);

  const marketCapByTimestamp = new Map(marketCapChart.values.map((point) => [point.x, point.y]));
  const volumeByTimestamp = new Map(volumeChart.values.map((point) => [point.x, point.y]));

  return priceChart.values.map((point) => ({
    timestamp: point.x * 1000,
    price: point.y,
    marketCap: marketCapByTimestamp.get(point.x) ?? 0,
    totalVolume: volumeByTimestamp.get(point.x) ?? 0,
    drawdown: 0
  }));
}

export async function fetchCirculatingSupplyHistory() {
  const response = await fetchBlockchainChart("total-bitcoins", "all", true);

  return response.values.map((point) => ({
    timestamp: point.x * 1000,
    value: point.y
  }));
}

export async function fetchTradeVolumeHistory() {
  const response = await fetchBlockchainChart("trade-volume", "1year", true);

  return response.values.map((point) => ({
    timestamp: point.x * 1000,
    value: point.y
  }));
}

export async function fetchHashrateHistory(): Promise<HashratePoint[]> {
  const response = await fetchBlockchainChart("hash-rate");

  return response.values.map((point) => ({
    timestamp: point.x * 1000,
    value: point.y / 1_000_000
  }));
}

export async function fetchTransactionFeeHistory(): Promise<FeePoint[]> {
  const response = await fetchBlockchainChart("transaction-fees");

  return response.values.map((point) => ({
    timestamp: point.x * 1000,
    value: point.y
  }));
}
