function simpleHash(source: string) {
  let hash = 0;
  for (let i = 0; i < source.length; i++) {
    const charCode = source.charCodeAt(i);
    hash += charCode;
  }
  return hash;
}

export function findStableTimestamp(seed: string, maxDays: number) {
  const buffer = 10;
  const period = maxDays - buffer;
  const hash = simpleHash(seed) % period;

  const now = Date.now();
  const daysSinceEpoch = Math.floor(now / 86400000);
  const position = daysSinceEpoch % period;

  const daysAfterStart = position > hash ? hash + period : hash;
  const daysToAdd = daysAfterStart - position;
  const daysToAddTotal = daysToAdd < buffer ? daysToAdd + period : daysToAdd;

  return (daysSinceEpoch + daysToAddTotal) * 86400000;
}
