import { z } from "zod";
import { fetchJson } from "@/lib/api/http";
import type { LiveMarketSnapshot } from "@/lib/types/dashboard";

const coingeckoMarketSchema = z.object({
  bitcoin: z.object({
    usd: z.number().positive(),
    usd_market_cap: z.number().positive().nullable().optional(),
    usd_24h_vol: z.number().nonnegative().nullable().optional(),
    usd_24h_change: z.number().nullable().optional(),
    last_updated_at: z.number().positive().nullable().optional()
  })
});

const mempoolPriceSchema = z.object({
  time: z.number().positive().nullable().optional(),
  USD: z.number().positive()
});

function secondsToIso(seconds: number | null | undefined) {
  return seconds ? new Date(seconds * 1000).toISOString() : new Date().toISOString();
}

export async function fetchCoinGeckoMarketSnapshot(): Promise<LiveMarketSnapshot> {
  const response = await fetchJson(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true",
    undefined,
    (value) => coingeckoMarketSchema.parse(value)
  );

  return {
    currentPrice: response.bitcoin.usd,
    marketCap: response.bitcoin.usd_market_cap ?? null,
    totalVolume: response.bitcoin.usd_24h_vol ?? null,
    priceChange24h: response.bitcoin.usd_24h_change ?? null,
    lastUpdated: secondsToIso(response.bitcoin.last_updated_at),
    source: "CoinGecko"
  };
}

export async function fetchMempoolMarketSnapshot(): Promise<LiveMarketSnapshot> {
  const response = await fetchJson(
    "https://mempool.space/api/v1/prices",
    undefined,
    (value) => mempoolPriceSchema.parse(value)
  );

  return {
    currentPrice: response.USD,
    marketCap: null,
    totalVolume: null,
    priceChange24h: null,
    lastUpdated: secondsToIso(response.time),
    source: "mempool.space"
  };
}

export async function fetchLiveMarketSnapshot(): Promise<LiveMarketSnapshot> {
  const [coingeckoResult, mempoolResult] = await Promise.allSettled([
    fetchCoinGeckoMarketSnapshot(),
    fetchMempoolMarketSnapshot()
  ]);

  if (coingeckoResult.status === "fulfilled") {
    const coingecko = coingeckoResult.value;

    if (mempoolResult.status === "fulfilled") {
      const mempool = mempoolResult.value;
      const coingeckoTime = new Date(coingecko.lastUpdated).getTime();
      const mempoolTime = new Date(mempool.lastUpdated).getTime();

      if (mempoolTime > coingeckoTime + 15 * 60 * 1000) {
        return {
          ...coingecko,
          currentPrice: mempool.currentPrice,
          lastUpdated: mempool.lastUpdated,
          source: "mempool.space",
          note:
            "Spot price came from mempool.space because it was fresher; market cap, volume, and 24-hour change came from CoinGecko."
        };
      }
    }

    return coingecko;
  }

  if (mempoolResult.status === "fulfilled") {
    return {
      ...mempoolResult.value,
      note: "CoinGecko was unavailable, so live price uses mempool.space and derived market values."
    };
  }

  throw new Error("Live market sources are temporarily unavailable.");
}
