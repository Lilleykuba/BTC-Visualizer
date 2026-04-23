export const DATA_SOURCES = [
  {
    name: "CoinGecko",
    href: "https://docs.coingecko.com/reference/simple-price",
    note: "Current BTC price, market cap, volume, and 24-hour market move"
  },
  {
    name: "mempool.space",
    href: "https://mempool.space/docs/api",
    note: "Open-source price fallback, fee recommendations, and difficulty adjustment context"
  },
  {
    name: "Blockchain.com Charts",
    href: "https://www.blockchain.com/charts",
    note: "Register-less long-run chart data for price, supply, volume, hashrate, and fees"
  },
  {
    name: "Mempool Open Source Project",
    href: "https://github.com/mempool/mempool",
    note: "Open-source project behind mempool.space"
  }
] as const;
