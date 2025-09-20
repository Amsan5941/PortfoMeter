// Portfolio and Holdings Types
export interface PortfolioHolding {
  symbol: string;
  companyName?: string;
  quantity: number;
  price: number;
  costBasis: number;
  marketValue: number;
  confidenceScore: number;
  isVerified: boolean;
}

export interface PortfolioMetrics {
  totalValue: number;
  totalCostBasis: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  topHolding: PortfolioHolding;
  topHoldingWeight: number;
  diversificationScore: number;
  volatilityScore: number;
  sectorConcentration: Record<string, number>;
}

export interface AIReview {
  summary: string;
  strengths: string[];
  risks: string[];
  suggestions: string[];
  disclaimer: string;
  overallScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

// Stock Data Types
export interface StockQuote {
  symbol: string;
  price: number;
  changeAmount: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio?: number;
  high52w: number;
  low52w: number;
  lastUpdated: string;
}

export interface StockSearchResult {
  symbol: string;
  companyName: string;
  exchange?: string;
  sector?: string;
  industry?: string;
}

export interface MarketMover {
  symbol: string;
  changePercent: number;
  changeAmount: number;
  volume: number;
  moverType: 'gainer' | 'loser';
  date: string;
}

// Upload and OCR Types
export interface UploadFile {
  file: File;
  preview: string;
}

export interface OCRResult {
  text: string;
  confidence: number;
  boundingBoxes: Array<{
    text: string;
    confidence: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

export interface ParsedHolding {
  symbol: string;
  quantity: number;
  price: number;
  costBasis: number;
  confidence: number;
  rawText: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Form Types
export interface UploadFormData {
  file: File;
  description?: string;
}

export interface SearchFormData {
  query: string;
  type: 'symbol' | 'company';
}

// Navigation Types
export type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
};

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Chart Types
export interface ChartDataPoint {
  date: string;
  price: number;
  volume?: number;
}

export interface ChartData {
  symbol: string;
  data: ChartDataPoint[];
  period: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y';
}

// User Types
export interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

// Upload Status Types
export type UploadStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface UploadProgress {
  status: UploadStatus;
  progress: number;
  message: string;
  error?: string;
}
