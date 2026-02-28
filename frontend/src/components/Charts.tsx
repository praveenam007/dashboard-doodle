import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from "recharts";
import { ChevronDown } from "lucide-react";

interface RevenueTrendData {
  year_month: string;
  revenue: number;
  dimension_value?: string;
}

interface GrowthData {
  dimension_value: string;
  growth_pct: number;
  current_revenue: number;
  compare_revenue: number;
}

interface ChartsProps {
  revenueTrendData: RevenueTrendData[];
  growthData: GrowthData[];
  dimension: string;
  granularity: string;
  onGranularityChange: (granularity: string) => void;
}

function formatRevenue(value: number): string {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${value.toFixed(0)}`;
}

function formatDateLabel(dateStr: string, granularity: string): string {
  if (granularity === "daily") {
    // Format as "Jan 3" for daily
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } else if (granularity === "weekly") {
    // Format as "Week of Jan 6" for weekly
    const date = new Date(dateStr);
    const formatted = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `Week of ${formatted}`;
  } else {
    // Format as "Jan 2025" for monthly
    const [year, month] = dateStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }
}

// Custom YAxis tick component for truncating long names
const CustomYAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const fullText = payload.value;
  const displayText = fullText.length > 6 ? fullText.substring(0, 6) + '...' : fullText;
  
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={4}
        textAnchor="end"
        fill="#6b7280"
        fontSize={11}
      >
        <title>{fullText}</title>
        {displayText}
      </text>
    </g>
  );
};

export function Charts({ revenueTrendData, growthData, dimension, granularity, onGranularityChange }: ChartsProps) {
  const [showGranularityDropdown, setShowGranularityDropdown] = React.useState(false);

  // Prepare revenue trend data
  // Check if data has dimension_value (multi-series) or not (single series)
  const hasDimension = revenueTrendData.length > 0 && revenueTrendData[0].dimension_value !== undefined;
  
  // Get top 5 dimension values by total revenue
  const topDimensionValues = hasDimension 
    ? Object.entries(
        revenueTrendData.reduce((acc, d) => {
          if (d.dimension_value) {
            acc[d.dimension_value] = (acc[d.dimension_value] || 0) + d.revenue;
          }
          return acc;
        }, {} as Record<string, number>)
      )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([dimValue]) => dimValue)
    : [];

  // Filter data to only include top 5 dimension values
  const filteredTrendData = hasDimension
    ? revenueTrendData.filter(d => topDimensionValues.includes(d.dimension_value!))
    : revenueTrendData;
  
  let trendChartData;
  
  if (hasDimension) {
    // Group by year_month and create separate series for each dimension value
    const groupedByMonth = filteredTrendData.reduce((acc, d) => {
      if (!acc[d.year_month]) {
        acc[d.year_month] = { year_month: d.year_month };
      }
      acc[d.year_month][d.dimension_value!] = d.revenue;
      return acc;
    }, {} as Record<string, any>);
    
    trendChartData = Object.values(groupedByMonth).map((d: any) => ({
      label: formatDateLabel(d.year_month, granularity),
      ...d
    }));
  } else {
    // Single series
    trendChartData = filteredTrendData.map((d) => ({
      label: formatDateLabel(d.year_month, granularity),
      revenue: d.revenue,
    }));
  }

  // Get unique dimension values for creating multiple lines (top 5 only)
  const dimensionValues = topDimensionValues;

  // Color palette for multiple lines
  const colors = ["#0d9488", "#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

  // Prepare growth data - Top 5 by absolute growth percentage
  const growthChartData = growthData
    .filter(d => d.dimension_value !== null)
    .map((d) => ({
      name: d.dimension_value,
      growth: d.growth_pct || 0,
    }))
    .sort((a, b) => Math.abs(b.growth) - Math.abs(a.growth))
    .slice(0, 5);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      {/* Revenue Trend Chart */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '0.75rem', 
        padding: '1.25rem', 
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ 
            fontSize: '0.875rem', 
            fontWeight: 700, 
            color: '#111827', 
            margin: 0,
            textTransform: 'uppercase', 
            letterSpacing: '0.05em'
          }}>
            {hasDimension ? `Top 5 ${dimension} Revenue Trend` : 'Revenue Trend'}
          </h3>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowGranularityDropdown(!showGranularityDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: '#374151',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#0d9488'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
            >
              {granularity.charAt(0).toUpperCase() + granularity.slice(1)}
              <ChevronDown style={{ width: '14px', height: '14px' }} />
            </button>
            {showGranularityDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.25rem',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                zIndex: 50,
                minWidth: '120px'
              }}>
                {(['daily', 'weekly', 'monthly'] as const).map((gran) => (
                  <div
                    key={gran}
                    onClick={() => {
                      onGranularityChange(gran);
                      setShowGranularityDropdown(false);
                    }}
                    style={{
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      color: granularity === gran ? '#0d9488' : '#111827',
                      fontWeight: granularity === gran ? 600 : 400,
                      backgroundColor: granularity === gran ? '#f0fdfa' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (granularity !== gran) e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      if (granularity !== gran) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {gran.charAt(0).toUpperCase() + gran.slice(1)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trendChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 10, fill: "#6b7280" }} 
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
              formatter={(value: number, name: string) => [formatRevenue(value), hasDimension ? name : "Revenue"]}
            />
            {hasDimension ? (
              // Multiple lines for each dimension value
              dimensionValues.map((dimValue, index) => (
                <Line 
                  key={dimValue}
                  type="monotone" 
                  dataKey={dimValue}
                  name={dimValue}
                  stroke={colors[index % colors.length]} 
                  strokeWidth={2} 
                  dot={{ r: 3 }} 
                  activeDot={{ r: 5 }}
                />
              ))
            ) : (
              // Single line
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#0d9488" 
                strokeWidth={2.5} 
                dot={{ r: 4, fill: "#0d9488" }} 
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Growth by Dimension Chart */}
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
          Top 5 Growth % by {dimension}
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={growthChartData} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
            <XAxis 
              type="number" 
              tick={{ fontSize: 10, fill: "#6b7280" }} 
              tickFormatter={(v) => `${v}%`} 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={<CustomYAxisTick />}
              width={80} 
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
              formatter={(value: number) => [`${value.toFixed(1)}%`, "Growth"]}
            />
            <Bar dataKey="growth" radius={[0, 4, 4, 0]} maxBarSize={24} label={{ position: 'right', formatter: (value: number) => `${value.toFixed(1)}%`, fontSize: 11, fill: '#6b7280' }}>
              {growthChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.growth >= 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
