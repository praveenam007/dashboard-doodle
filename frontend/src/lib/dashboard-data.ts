export interface MonthlyAggregate {
  month: string;
  label: string;
  totalRevenue: number;
}

export type HierarchyKey = 'product' | 'customer' | 'region';

export const HIERARCHY_DIMENSIONS: { key: HierarchyKey; label: string }[] = [
  { key: 'product', label: 'Product' },
  { key: 'customer', label: 'Customer' },
  { key: 'region', label: 'Region' },
];

export interface HierarchyBreakdown {
  dimension: string;
  currentRevenue: number;
  previousRevenue: number;
  growthPct: number;
  currentQty: number;
  previousQty: number;
  qtyGrowthPct: number;
}

export function formatINR(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
