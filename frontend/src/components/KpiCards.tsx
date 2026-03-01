import { TrendingUp, TrendingDown, IndianRupee, Package, CreditCard, TrendingUpIcon, Info, AlertTriangle } from "lucide-react";

interface KPIData {
  current_revenue: number;
  current_quantity: number;
  current_transactions: number;
  current_avg_revenue_per_txn: number;
  current_gross_revenue: number;
  current_returns: number;
  current_returns_impact_pct: number;
  compare_revenue?: number;
  compare_quantity?: number;
  compare_transactions?: number;
  compare_avg_revenue_per_txn?: number;
  compare_gross_revenue?: number;
  compare_returns?: number;
  compare_returns_impact_pct?: number;
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
  // Show loading skeleton while data is being fetched
  if (!data) {
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(9, 1fr)', 
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {Array.from({ length: 9 }).map((_, index) => (
          <LoadingSkeleton key={index} />
        ))}
      </div>
    );
  }

  const revenueGrowth = data.compare_revenue 
    ? calculateGrowth(data.current_revenue || 0, data.compare_revenue)
    : 0;
  
  const volumeGrowth = data.compare_quantity
    ? calculateGrowth(data.current_quantity || 0, data.compare_quantity)
    : 0;

  const avgRevenuePerCase = (data.current_quantity || 0) > 0 ? (data.current_revenue || 0) / data.current_quantity : 0;
  const compareAvgRevenuePerCase = data.compare_quantity && data.compare_revenue && data.compare_quantity > 0 
    ? data.compare_revenue / data.compare_quantity 
    : 0;
  const priceGrowth = compareAvgRevenuePerCase > 0
    ? calculateGrowth(avgRevenuePerCase, compareAvgRevenuePerCase)
    : 0;

  const grossRevenueGrowth = data.compare_gross_revenue
    ? calculateGrowth(data.current_gross_revenue || 0, data.compare_gross_revenue)
    : 0;

  const returnsGrowth = data.compare_returns
    ? calculateGrowth(data.current_returns || 0, data.compare_returns)
    : 0;

  const currentReturnsImpactPct = data.current_returns_impact_pct ?? 0;
  const compareReturnsImpactPct = data.compare_returns_impact_pct ?? 0;
  const returnsImpactChange = compareReturnsImpactPct > 0
    ? currentReturnsImpactPct - compareReturnsImpactPct
    : 0;

  // Color coding for returns impact %
  const getReturnsImpactColor = (pct: number) => {
    if (pct <= 5) return '#059669'; // Healthy (green)
    if (pct <= 10) return '#f59e0b'; // Warning (amber)
    return '#dc2626'; // Serious (red)
  };

  const getReturnsImpactStatus = (pct: number) => {
    if (pct <= 5) return 'Healthy';
    if (pct <= 10) return 'Warning';
    return 'Critical';
  };

  const cards = [
    {
      title: "TOTAL REVENUE",
      value: formatCurrency(data.current_revenue || 0),
      icon: <IndianRupee className="w-3 h-3" />,
      growth: revenueGrowth,
    },
    {
      title: "GROWTH % ",
      value: `${revenueGrowth > 0 ? "+" : ""}${revenueGrowth.toFixed(1)}%`,
      icon: revenueGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />,
      isGrowthCard: true,
      growthValue: revenueGrowth,
      showInfoIcon: true,
      tooltipText: "Formula: ((Current Revenue - Previous Revenue) / Previous Revenue) × 100",
    },
    {
      title: "VOLUME",
      value: formatNumber(data.current_quantity || 0),
      icon: <Package className="w-3 h-3" />,
      growth: volumeGrowth,
    },
    {
      title: "GROWTH %",
      value: `${volumeGrowth > 0 ? "+" : ""}${volumeGrowth.toFixed(1)}%`,
      icon: volumeGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />,
      isGrowthCard: true,
      growthValue: volumeGrowth,
      showInfoIcon: true,
      tooltipText: "Formula: ((Current Volume - Previous Volume) / Previous Volume) × 100",
    },
    {
      title: "AVG REVENUE ",
      value: formatCurrency(avgRevenuePerCase),
      icon: <TrendingUpIcon className="w-3 h-3" />,
      growth: priceGrowth,
    },
    {
      title: "GROWTH %",
      value: `${priceGrowth > 0 ? "+" : ""}${priceGrowth.toFixed(1)}%`,
      icon: priceGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />,
      isGrowthCard: true,
      growthValue: priceGrowth,
      showInfoIcon: true,
      tooltipText: "Formula: ((Current Avg Price - Previous Avg Price) / Previous Avg Price) × 100",
    },
    {
      title: "GROSS REVENUE (₹)",
      value: formatCurrency(data.current_gross_revenue || 0),
      icon: <IndianRupee className="w-3 h-3" />,
      growth: grossRevenueGrowth,
      showInfoIcon: true,
      tooltipText: "Formula: SUM(Amount WHERE Amount > 0) - Revenue from positive transactions only",
    },
    {
      title: "RETURNS (₹)",
      value: formatCurrency(data.current_returns || 0),
      icon: <TrendingDown className="w-3 h-3" />,
      growth: returnsGrowth,
      showInfoIcon: true,
      tooltipText: "Formula: ABS(SUM(Amount WHERE Amount < 0)) - Absolute value of negative transactions",
      isNegativeMetric: true,
    },
    {
      title: "RETURN IMPACT % ",
      value: `${currentReturnsImpactPct.toFixed(2)}%`,
      subtitle: getReturnsImpactStatus(currentReturnsImpactPct),
      icon: currentReturnsImpactPct > 10 ? <AlertTriangle className="w-3 h-3" /> : <Info className="w-3 h-3" />,
      growth: returnsImpactChange,
      customColor: getReturnsImpactColor(currentReturnsImpactPct),
      showInfoIcon: true,
      tooltipText: "Formula: (Returns / Gross Revenue) × 100 | 0-5%: Healthy | 5-10%: Warning | >10%: Critical",
      isPercentageMetric: true,
    },
  ];

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(9, 1fr)', 
      gap: '1rem',
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
  customColor?: string;
  isNegativeMetric?: boolean;
  isPercentageMetric?: boolean;
}

function KPICard({ title, value, subtitle, growth, icon, compareMonth, isGrowthCard, growthValue, showInfoIcon, tooltipText, customColor, isNegativeMetric, isPercentageMetric }: KPICardProps) {
  const isPositive = growth !== undefined && growth > 0;
  const isNegative = growth !== undefined && growth < 0;
  
  // Use custom color if provided, otherwise use default logic
  const valueColor = customColor || (isGrowthCard 
    ? (growthValue && growthValue >= 0 ? '#059669' : '#dc2626')
    : '#111827');

  // For negative metrics (like returns), inverse the growth color logic
  const growthColor = isNegativeMetric 
    ? (growth && growth < 0 ? '#059669' : '#dc2626')  // Lower is better for returns
    : (growth && growth >= 0 ? '#059669' : '#dc2626');  // Higher is better for normal metrics

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '0.375rem', 
      padding: '0.375rem 0.5rem', 
      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', 
      border: '1px solid #e5e7eb',
      transition: 'box-shadow 0.3s'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          <p style={{ fontSize: '0.55rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            {title}
          </p>
          {showInfoIcon && tooltipText && (
            <div 
              style={{ position: 'relative', display: 'inline-flex', cursor: 'help' }} 
              title={tooltipText}
            >
              <Info style={{ width: '10px', height: '10px', color: '#9ca3af' }} />
            </div>
          )}
        </div>
        {icon && <div style={{ color: customColor || (isGrowthCard && growthValue !== undefined && growthValue >= 0 ? '#059669' : '#0d9488'), opacity: 0.6 }}>{icon}</div>}
      </div>
      <p style={{ fontSize: '0.95rem', fontWeight: 'bold', color: valueColor, marginBottom: '0.15rem', margin: 0 }}>
        {value}
      </p>
      {subtitle && (
        <p style={{ fontSize: '0.55rem', fontWeight: 600, color: customColor, margin: '0.1rem 0 0.15rem 0', textTransform: 'uppercase' }}>
          {subtitle}
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem' }}>
        {growth !== undefined && !isPercentageMetric && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.15rem',
              fontSize: '0.6rem',
              fontWeight: 600,
              color: growthColor,
            }}
          >
            {growth >= 0 ? <TrendingUp style={{ width: '8px', height: '8px' }} /> : <TrendingDown style={{ width: '8px', height: '8px' }} />}
            {growth > 0 ? "+" : ""}{growth.toFixed(1)}%
          </span>
        )}
        {growth !== undefined && isPercentageMetric && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.15rem',
              fontSize: '0.6rem',
              fontWeight: 600,
              color: growth < 0 ? '#059669' : '#dc2626', // Lower is better for impact %
            }}
          >
            {growth >= 0 ? <TrendingUp style={{ width: '8px', height: '8px' }} /> : <TrendingDown style={{ width: '8px', height: '8px' }} />}
            {growth > 0 ? "+" : ""}{growth.toFixed(2)}pp
          </span>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '0.375rem', 
      padding: '0.375rem 0.5rem', 
      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', 
      border: '1px solid #e5e7eb',
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
        <div style={{ 
          height: '0.55rem', 
          backgroundColor: '#e5e7eb', 
          borderRadius: '0.25rem', 
          width: '60%' 
        }} />
        <div style={{ 
          width: '12px', 
          height: '12px', 
          backgroundColor: '#e5e7eb', 
          borderRadius: '0.25rem' 
        }} />
      </div>
      <div style={{ 
        height: '0.95rem', 
        backgroundColor: '#e5e7eb', 
        borderRadius: '0.25rem', 
        width: '80%',
        marginBottom: '0.15rem'
      }} />
      <div style={{ 
        height: '0.6rem', 
        backgroundColor: '#e5e7eb', 
        borderRadius: '0.25rem', 
        width: '40%',
        marginLeft: 'auto'
      }} />
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}