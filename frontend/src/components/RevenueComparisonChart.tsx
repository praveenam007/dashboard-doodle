import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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

export function RevenueComparisonChart({ data, dimension, currentMonth, compareMonth }: RevenueComparisonChartProps) {
  const chartData = data.map((d) => ({
    name: d.dimension_value,
    previous: d.compare_revenue,
    current: d.current_revenue,
  }));

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
        Revenue Comparison by {dimension}
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11, fill: "#6b7280" }} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: "#6b7280" }} 
            tickFormatter={(v) => formatRevenue(v)} 
            tickLine={false} 
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: number, name: string) => [
              formatRevenue(value), 
              name === "previous" ? "Previous Period" : "Current Period"
            ]}
          />
          <Legend 
            wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
            iconType="square"
          />
          <Bar 
            dataKey="previous" 
            name="Previous Period" 
            fill="#d1d5db" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={40}
          />
          <Bar 
            dataKey="current" 
            name="Current Period" 
            fill="#0d9488" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
