'use client';

/** Deterministic pseudo-random number generator seeded by a string */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

/**
 * Generates a deterministic synthetic price history for sparkline display.
 * Seeded by symbol so the chart is stable across renders.
 */
export function generatePriceHistory(
  symbol: string,
  currentPrice: number,
  changePercent: number,
  points = 30
): number[] {
  const rand = mulberry32(hashStr(symbol));
  const dailyVol = 0.012 + Math.abs(changePercent) * 0.0008;
  const prices: number[] = [];
  let p = currentPrice;

  // Walk backwards from current price
  for (let i = 0; i < points; i++) {
    prices.unshift(p);
    const drift = (rand() - 0.5) * dailyVol * 2;
    p = p / (1 + drift);
  }

  // Apply a subtle trend bias so the chart visually reflects today's direction
  const trendBias = changePercent > 0 ? -0.025 : 0.025;
  return prices.map((v, i) => v * (1 + trendBias * (1 - i / (points - 1))));
}

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  /** true = green (price up), false = red (price down) */
  positive?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  width = 120,
  height = 40,
  positive = true,
  className = '',
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 2;

  const toX = (i: number) => pad + (i / (data.length - 1)) * (width - pad * 2);
  const toY = (v: number) => pad + (1 - (v - min) / range) * (height - pad * 2);

  const linePoints = data.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
  const areaPoints = `${toX(0)},${height} ${linePoints} ${toX(data.length - 1)},${height}`;

  const stroke = positive ? '#16a34a' : '#dc2626';
  const fill = positive ? '#dcfce7' : '#fee2e2';

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-label="price sparkline chart"
      role="img"
    >
      <polygon points={areaPoints} fill={fill} opacity="0.5" />
      <polyline
        points={linePoints}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
