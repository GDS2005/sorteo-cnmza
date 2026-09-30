// Unbiased integer in [0, max) using crypto.getRandomValues + rejection sampling.
export function randomInt(max: number): number {
  const range = 0x100000000;
  const limit = range - (range % max);
  const buf = new Uint32Array(1);
  do { crypto.getRandomValues(buf); } while (buf[0] >= limit);
  return buf[0] % max;
}

// Fisher–Yates shuffle on a copy; take the first n elements => n distinct winners.
export function pickWinners<T>(pool: readonly T[], n: number): T[] {
  const a = [...pool];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}
