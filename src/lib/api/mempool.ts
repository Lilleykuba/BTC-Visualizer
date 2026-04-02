import { z } from "zod";
import type { RecommendedFees } from "@/lib/types/dashboard";
import { fetchJson } from "@/lib/api/http";

const recommendedFeesSchema = z.object({
  fastestFee: z.number(),
  halfHourFee: z.number(),
  hourFee: z.number(),
  economyFee: z.number(),
  minimumFee: z.number()
});

const difficultyAdjustmentSchema = z
  .object({
    difficultyChange: z.number().nullable().optional(),
    remainingBlocks: z.number().nullable().optional(),
    estimatedRetargetDate: z.number().nullable().optional()
  })
  .passthrough();

export async function fetchRecommendedFees(): Promise<RecommendedFees> {
  return fetchJson(
    "https://mempool.space/api/v1/fees/recommended",
    undefined,
    (value) => recommendedFeesSchema.parse(value)
  );
}

export async function fetchDifficultyAdjustment() {
  return fetchJson(
    "https://mempool.space/api/v1/difficulty-adjustment",
    undefined,
    (value) => difficultyAdjustmentSchema.parse(value)
  );
}
