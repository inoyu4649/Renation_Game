/**
 * Format numbers into Korean readable units (억, 만)
 */
export function formatKoreanNumber(num: number): string {
  if (num >= 100_000_000) {
    const eok = num / 100_000_000;
    return `${eok.toFixed(2).replace(/\.?0+$/, '')}억명`;
  }
  if (num >= 10_000) {
    const man = Math.round(num / 10_000);
    return `${man.toLocaleString()}만명`;
  }
  return `${num.toLocaleString()}명`;
}

/**
 * Format 1 in N odds
 */
export function formatOdds(probabilityPct: number): string {
  if (probabilityPct <= 0) return '0%';
  const oneInN = Math.round(100 / probabilityPct);
  return `약 ${oneInN.toLocaleString()}번 중 1번`;
}
