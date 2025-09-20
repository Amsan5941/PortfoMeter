import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
}

export function formatPercentage(num: number): string {
  return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
  return `${sanitizedName}_${timestamp}.${extension}`;
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp', 'image/webp'];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File must be an image (PNG, JPG, JPEG, GIF, BMP, WebP)' };
  }

  return { valid: true };
}

export function calculatePortfolioMetrics(holdings: Array<{
  quantity: number;
  price: number;
  costBasis: number;
}>): {
  totalValue: number;
  totalCostBasis: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
} {
  const totalValue = holdings.reduce((sum, holding) => sum + (holding.quantity * holding.price), 0);
  const totalCostBasis = holdings.reduce((sum, holding) => sum + (holding.quantity * holding.costBasis), 0);
  const totalGainLoss = totalValue - totalCostBasis;
  const totalGainLossPercent = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;

  return {
    totalValue,
    totalCostBasis,
    totalGainLoss,
    totalGainLossPercent,
  };
}

export function calculateDiversificationScore(holdings: Array<{
  symbol: string;
  quantity: number;
  price: number;
}>): number {
  if (holdings.length <= 1) return 0;

  const totalValue = holdings.reduce((sum, holding) => sum + (holding.quantity * holding.price), 0);
  const weights = holdings.map(holding => (holding.quantity * holding.price) / totalValue);
  
  // Calculate Herfindahl-Hirschman Index (HHI)
  const hhi = weights.reduce((sum, weight) => sum + weight * weight, 0);
  
  // Convert to diversification score (0-100, higher is more diversified)
  const maxHhi = 1; // When all weight is in one stock
  const minHhi = 1 / holdings.length; // When perfectly diversified
  const diversificationScore = ((maxHhi - hhi) / (maxHhi - minHhi)) * 100;
  
  return Math.max(0, Math.min(100, diversificationScore));
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

