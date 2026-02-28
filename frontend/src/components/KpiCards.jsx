function KpiCards({ data }) {
  if (!Array.isArray(data)) return null;

  // Remove bad / incomplete rows
  const cleaned = data.filter(
    d => d && typeof d.year_month === "string"
  );

  if (cleaned.length === 0) return null;

  // Sort safely
  const sorted = cleaned.sort((a, b) =>
    a.year_month.localeCompare(b.year_month)
  );

  const latest = sorted[sorted.length - 1];

  return (
    <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
      <div style={cardStyle}>
        <h4>Revenue (Latest Month)</h4>
        <p>₹ {Number(latest.revenue || 0).toLocaleString()}</p>
      </div>

      <div style={cardStyle}>
        <h4>Growth %</h4>
        <p>
          {latest.growth_pct == null
            ? "N/A"
            : `${(latest.growth_pct * 100).toFixed(1)}%`}
        </p>
      </div>
    </div>
  );
}import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  growth?: number;
  icon?: React.ReactNode;
}

export function KPICard({ title, value, subtitle, growth, icon }: KPICardProps) {
  const isPositive = growth !== undefined && growth > 0;
  const isNegative = growth !== undefined && growth < 0;
  const isNeutral = growth === undefined || growth === 0;

  return (
    <div className="glass-card rounded-xl p-5 kpi-glow transition-all duration-300 hover:shadow-md">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
        {icon && <div className="text-primary opacity-60">{icon}</div>}
      </div>
      <p className="text-3xl font-bold tracking-tight text-foreground font-mono">{value}</p>
      <div className="flex items-center gap-2 mt-2">
        {growth !== undefined && (
          <span
            className={`inline-flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-full ${
              isPositive
                ? "text-chart-positive bg-chart-positive/10"
                : isNegative
                ? "text-chart-negative bg-chart-negative/10"
                : "text-muted-foreground bg-muted"
            }`}
          >
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : isNegative ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
            {isPositive ? "+" : ""}
            {growth.toFixed(1)}%
          </span>
        )}
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
      </div>
    </div>
  );
}


const cardStyle = {
  padding: "16px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  minWidth: "200px"
};

export default KpiCards;