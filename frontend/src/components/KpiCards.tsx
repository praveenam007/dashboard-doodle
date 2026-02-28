import { TrendingUp, TrendingDown, IndianRupee, Package, CreditCard, TrendingUpIcon, Info } from "lucide-react";

interface KPIData {
  current_revenue: number;
  current_quantity: number;
  current_transactions: number;
  current_avg_revenue_per_txn: number;
  compare_revenue?: number;
  compare_quantity?: number;
  compare_transactions?: number;
  compare_avg_revenue_per_txn?: number;
}

interface KpiCardsProps {
  data: KPIData | null;
  compareMonth: string;
}

function formatNumber(num: number): string {
  if (num >= 100000) {
    return `${(num / 100000).toFixed(2)} L`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)} K`;
  }
  return num.toFixed(0);
}

function formatCurrency(num: number): string {
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  } else if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1)} K`;
  }
  return `₹${num.toFixed(0)}`;
}

function calculateGrowth(current: number, compare: number): number {
  if (!compare || compare === 0) return 0;
  return ((current - compare) / compare) * 100;
}

export default function KpiCards({ data, compareMonth }: KpiCardsProps) {
  if (!data) return null;

  const revenueGrowth = data.compare_revenue 
    ? calculateGrowth(data.current_revenue, data.compare_revenue)
    : 0;
  
  const volumeGrowth = data.compare_quantity
    ? calculateGrowth(data.current_quantity, data.compare_quantity)
    : 0;

  const avgRevenuePerCase = data.current_quantity > 0 ? data.current_revenue / data.current_quantity : 0;
  const compareAvgRevenuePerCase = data.compare_quantity && data.compare_revenue && data.compare_quantity > 0 
    ? data.compare_revenue / data.compare_quantity 
    : 0;
  const priceGrowth = compareAvgRevenuePerCase > 0
    ? calculateGrowth(avgRevenuePerCase, compareAvgRevenuePerCase)
    : 0;

  const cards = [
    {
      title: "TOTAL REVENUE (₹)",
      value: formatCurrency(data.current_revenue),
      icon: <IndianRupee className="w-5 h-5" />,
      growth: revenueGrowth,
    },
    {
      title: "GROWTH % VS PREVIOUS PERIOD",
      value: `${revenueGrowth > 0 ? "+" : ""}${revenueGrowth.toFixed(1)}%`,
      icon: revenueGrowth >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />,
      isGrowthCard: true,
      growthValue: revenueGrowth,
      showInfoIcon: true,
      tooltipText: "Formula: ((Current Revenue - Previous Revenue) / Previous Revenue) × 100",
    },
    {
      title: "VOLUME (CASES)",
      value: formatNumber(data.current_quantity),
      icon: <Package className="w-5 h-5" />,
      growth: volumeGrowth,
    },
    {
      title: "VOLUME GROWTH %",
      value: `${volumeGrowth > 0 ? "+" : ""}${volumeGrowth.toFixed(1)}%`,
      icon: volumeGrowth >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />,
      isGrowthCard: true,
      growthValue: volumeGrowth,
      showInfoIcon: true,
      tooltipText: "Formula: ((Current Volume - Previous Volume) / Previous Volume) × 100",
    },
    {
      title: "AVG REVENUE / CASE",
      value: formatCurrency(avgRevenuePerCase),
      icon: <TrendingUpIcon className="w-5 h-5" />,
      growth: priceGrowth,
    },
    {
      title: "PRICE GROWTH %",
      value: `${priceGrowth > 0 ? "+" : ""}${priceGrowth.toFixed(1)}%`,
      icon: priceGrowth >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />,
      isGrowthCard: true,
      growthValue: priceGrowth,
      showInfoIcon: true,
      tooltipText: "Formula: ((Current Avg Price - Previous Avg Price) / Previous Avg Price) × 100",
    },
  ];

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(6, 1fr)', 
      gap: '1.5rem',
      marginBottom: '1.5rem'
    }}>
      {cards.map((card, index) => (
        <KPICard key={index} {...card} compareMonth={compareMonth} />
      ))}
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  growth?: number;
  icon?: React.ReactNode;
  compareMonth: string;
  isGrowthCard?: boolean;
  growthValue?: number;
  showInfoIcon?: boolean;
  tooltipText?: string;
}

function KPICard({ title, value, subtitle, growth, icon, compareMonth, isGrowthCard, growthValue, showInfoIcon, tooltipText }: KPICardProps) {
  const isPositive = growth !== undefined && growth > 0;
  const isNegative = growth !== undefined && growth < 0;
  
  const valueColor = isGrowthCard 
    ? (growthValue && growthValue >= 0 ? '#059669' : '#dc2626')
    : '#111827';

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '0.5rem', 
      padding: '0.875rem 1rem', 
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', 
      border: '1px solid #e5e7eb',
      transition: 'box-shadow 0.3s'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            {title}
          </p>
          {showInfoIcon && tooltipText && (
            <div 
              style={{ position: 'relative', display: 'inline-flex', cursor: 'help' }} 
              title={tooltipText}
            >
              <Info style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
            </div>
          )}
        </div>
        {icon && <div style={{ color: isGrowthCard && growthValue !== undefined && growthValue >= 0 ? '#059669' : '#0d9488', opacity: 0.6 }}>{icon}</div>}
      </div>
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: valueColor, marginBottom: '0.375rem', margin: 0 }}>
        {value}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
        {growth !== undefined && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: growth >= 0 ? '#059669' : '#dc2626',
            }}
          >
            {growth >= 0 ? <TrendingUp style={{ width: '12px', height: '12px' }} /> : <TrendingDown style={{ width: '12px', height: '12px' }} />}
            {growth > 0 ? "+" : ""}{growth.toFixed(1)}%
          </span>
        )}
        {subtitle && (
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>vs {compareMonth}</span>
        )}
      </div>
    </div>
  );
}