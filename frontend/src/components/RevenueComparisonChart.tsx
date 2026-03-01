import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

interface BreakdownData {
  dimension_value: string;
  current_revenue: number;
  compare_revenue: number;
  revenue_growth_pct: number;
  current_quantity: number;
  compare_quantity: number;
  quantity_growth_pct: number;
}

interface RevenueComparisonChartProps {
  data: BreakdownData[];
  dimension: string;
  currentMonth: string;
  compareMonth: string;
}

interface WaterfallDataPoint {
  name: string;
  value: number;
  base: number;
  top: number;
  connector: number;
  isStart: boolean;
  isEnd: boolean;
  isPositive: boolean;
}

function formatRevenue(value: number): string {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${value.toFixed(0)}`;
}

function formatMonthLabel(yearMonth: string): string {
  if (!yearMonth) return "";
  const [year, month] = yearMonth.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatDimensionName(dimension: string): string {
  const dimensionNames: Record<string, string> = {
    zone: "Zone",
    state: "State",
    channel: "Channel",
    category: "Category",
    sub_category: "Sub Category",
    segment: "Segment",
    city: "City",
    master_sku: "Master SKU",
    customer: "Customer",
    sales_leader: "Sales Leader",
    rsm: "RSM",
    asm: "ASM"
  };
  return dimensionNames[dimension] || dimension;
}

export function RevenueComparisonChart({ data, dimension, currentMonth, compareMonth }: RevenueComparisonChartProps) {
  // Show loading skeleton while data is being fetched
  if (!data || data.length === 0) {
    return <RevenueComparisonLoadingSkeleton />;
  }

  // Calculate waterfall data
  const previousTotal = data.reduce((sum, d) => sum + d.compare_revenue, 0);
  const currentTotal = data.reduce((sum, d) => sum + d.current_revenue, 0);

  // Sort categories by absolute contribution (largest impact first)
  const sortedData = [...data].sort((a, b) => {
    const deltaA = Math.abs(a.current_revenue - a.compare_revenue);
    const deltaB = Math.abs(b.current_revenue - b.compare_revenue);
    return deltaB - deltaA;
  });

  const waterfallData: WaterfallDataPoint[] = [];
  let runningTotal = previousTotal;

  // Start bar
  waterfallData.push({
    name: formatMonthLabel(compareMonth),
    value: previousTotal,
    base: 0,
    top: previousTotal,
    connector: previousTotal,
    isStart: true,
    isEnd: false,
    isPositive: true,
  });

  // Category contributions
  sortedData.forEach((item) => {
    const delta = item.current_revenue - item.compare_revenue;
    const isPositive = delta >= 0;
    const base = isPositive ? runningTotal : runningTotal - Math.abs(delta);
    const top = isPositive ? runningTotal + Math.abs(delta) : runningTotal;

    waterfallData.push({
      name: item.dimension_value,
      value: Math.abs(delta),
      base: base,
      top: top,
      connector: runningTotal,
      isStart: false,
      isEnd: false,
      isPositive,
    });

    runningTotal += delta;
  });

  // End bar
  waterfallData.push({
    name: formatMonthLabel(currentMonth),
    value: currentTotal,
    base: 0,
    top: currentTotal,
    connector: currentTotal,
    isStart: false,
    isEnd: true,
    isPositive: true,
  });

  const currentLabel = formatMonthLabel(currentMonth);
  const compareLabel = formatMonthLabel(compareMonth);

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '0.75rem', 
      padding: '1.25rem', 
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{ 
        fontSize: '0.875rem', 
        fontWeight: 700, 
        color: '#111827', 
        marginBottom: '1rem', 
        textTransform: 'uppercase', 
        letterSpacing: '0.05em'
      }}>
        Category Contribution ({compareLabel} → {currentLabel})
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={waterfallData}>
          <defs>
            <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="100%" stopColor="#10b981" stopOpacity={1}/>
            </linearGradient>
            <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.8}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11, fill: "#6b7280" }} 
            tickLine={false} 
            axisLine={{ stroke: "#e5e7eb" }}
            angle={-15}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: "#6b7280" }} 
            tickFormatter={(v) => formatRevenue(v)} 
            tickLine={false} 
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null;
              
              const data = payload[0].payload as WaterfallDataPoint;
              
              if (data.isStart) {
                return (
                  <div style={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "12px",
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: "4px" }}>Starting Revenue</div>
                    <div style={{ color: "#6b7280" }}>{formatRevenue(data.value)}</div>
                  </div>
                );
              }
              
              if (data.isEnd) {
                return (
                  <div style={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "12px",
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: "4px" }}>Ending Revenue</div>
                    <div style={{ color: "#6b7280" }}>{formatRevenue(data.value)}</div>
                  </div>
                );
              }
              
              return (
                <div style={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "12px",
                }}>
                  <div style={{ fontWeight: 600, marginBottom: "4px" }}>{data.name}</div>
                  <div style={{ 
                    color: data.isPositive ? "#059669" : "#dc2626",
                    fontSize: "14px",
                    fontWeight: 600
                  }}>
                    {data.isPositive ? "▲ +" : "▼ "}{formatRevenue(data.value)}
                  </div>
                  <div style={{ color: "#9ca3af", fontSize: "11px", marginTop: "4px" }}>
                    From {formatRevenue(data.base)} to {formatRevenue(data.top)}
                  </div>
                </div>
              );
            }}
          />
          {/* Invisible base bars for floating effect */}
          <Bar dataKey="base" stackId="a" fill="transparent" />
          {/* Visible floating bars */}
          <Bar 
            dataKey="value" 
            stackId="a" 
            radius={[6, 6, 6, 6]} 
            maxBarSize={60}
            stroke="#fff"
            strokeWidth={2}
          >
            {waterfallData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={
                  entry.isStart ? "#64748b" :
                  entry.isEnd ? "#0d9488" :
                  entry.isPositive ? "url(#positiveGradient)" : "url(#negativeGradient)"
                } 
              />
            ))}
          </Bar>
          {/* Connector line showing the flow */}
          <Line 
            type="stepAfter" 
            dataKey="connector" 
            stroke="#94a3b8" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function RevenueComparisonLoadingSkeleton() {
  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '0.75rem', 
      padding: '1.25rem', 
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ 
        height: '1rem', 
        backgroundColor: '#e5e7eb', 
        borderRadius: '0.25rem', 
        width: '40%',
        marginBottom: '1.5rem',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }} />
      <div style={{ 
        height: '280px', 
        backgroundColor: '#f3f4f6', 
        borderRadius: '0.5rem',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
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
