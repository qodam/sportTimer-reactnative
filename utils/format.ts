// 850 → "850", 1240 → "1,2k", 25300 → "25k", 1 400 000 → "1,4M"
export const formatCount = (n: number) => {
  if (n < 1000) return String(n);
  if (n < 1_000_000) {
    const k = n / 1000;
    return `${k < 10 ? k.toFixed(1).replace(/\.0$/, "") : Math.round(k)}k`;
  }
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
};
