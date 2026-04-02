const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1
});

const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1
});

const percentDetailFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
  signDisplay: "always"
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric"
});

const axisDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "2-digit"
});

export function formatCurrency(value: number | null | undefined, decimals = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Unavailable";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: decimals
  }).format(value);
}

export function formatCompactCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Unavailable";
  }

  return compactCurrencyFormatter.format(value);
}

export function formatCompactNumber(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Unavailable";
  }

  return compactNumberFormatter.format(value);
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Unavailable";
  }

  return percentDetailFormatter.format(value / 100);
}

export function formatPercentPlain(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Unavailable";
  }

  return percentFormatter.format(value / 100);
}

export function formatDate(value: number | string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return dateFormatter.format(date);
}

export function formatAxisDate(value: number) {
  return axisDateFormatter.format(new Date(value));
}

export function formatBtc(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Unavailable";
  }

  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits
  }).format(value)} BTC`;
}

export function formatSatVb(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Unavailable";
  }

  return `${new Intl.NumberFormat("en-US").format(value)} sat/vB`;
}

export function formatHashrateEh(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Unavailable";
  }

  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1
  }).format(value)} EH/s`;
}

export function formatDays(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Unavailable";
  }

  return `${Math.round(value).toLocaleString("en-US")} days`;
}

export function formatCurrencyShort(value: number) {
  if (value >= 10_000) {
    return compactCurrencyFormatter.format(value);
  }

  return currencyFormatter.format(value);
}
