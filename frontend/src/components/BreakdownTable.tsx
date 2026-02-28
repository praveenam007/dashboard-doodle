import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface BreakdownData {
  dimension_value: string;
  current_revenue: number;
  compare_revenue: number;
  revenue_growth_pct: number;
  current_quantity: number;
  compare_quantity: number;
  quantity_growth_pct: number;
}

interface BreakdownTableProps {
  data: BreakdownData[];
  dimension: string;
  currentMonth: string;
  compareMonth: string;
  availableDimensionValues: string[];
  selectedDimensionValues: string[];
  onDimensionValuesChange: (values: string[]) => void;
}

function formatRevenue(value: number): string {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)} K`;
  }
  return `₹${value.toFixed(0)}`;
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)} K`;
  }
  return num.toFixed(0);
}

function formatMonthLabel(yearMonth: string): string {
  if (!yearMonth) return "";
  const [year, month] = yearMonth.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function GrowthBadge({ value }: { value: number | null }) {
  if (value === null || value === undefined) return <span>-</span>;
  
  const isPositive = value > 0;
  const isNegative = value < 0;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        padding: '0.25rem 0.5rem',
        borderRadius: '9999px',
        color: isPositive ? '#10b981' : isNegative ? '#ef4444' : '#6b7280',
        backgroundColor: isPositive ? '#d1fae5' : isNegative ? '#fee2e2' : '#f3f4f6'
      }}
    >
      {isPositive ? <TrendingUp style={{ width: '12px', height: '12px' }} /> : isNegative ? <TrendingDown style={{ width: '12px', height: '12px' }} /> : null}
      {isPositive ? "+" : ""}{value.toFixed(1)}%
    </span>
  );
}

export function BreakdownTable({ data, dimension, currentMonth, compareMonth, availableDimensionValues, selectedDimensionValues, onDimensionValuesChange }: BreakdownTableProps) {
  const currentLabel = formatMonthLabel(currentMonth);
  const compareLabel = formatMonthLabel(compareMonth);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [sortColumn, setSortColumn] = useState<'name' | 'current_revenue' | 'compare_revenue' | 'revenue_growth' | 'current_quantity' | 'compare_quantity' | 'quantity_growth'>('revenue_growth');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const toggleDimensionValue = (value: string) => {
    if (selectedDimensionValues.includes(value)) {
      onDimensionValuesChange(selectedDimensionValues.filter(v => v !== value));
    } else {
      onDimensionValuesChange([...selectedDimensionValues, value]);
    }
  };

  const clearAllDimensionValues = () => {
    onDimensionValuesChange([]);
  };

  const selectAllDimensionValues = () => {
    onDimensionValuesChange(availableDimensionValues);
  };

  // Sort dimension values alphabetically
  const sortedDimensionValues = [...availableDimensionValues].sort((a, b) => a.localeCompare(b));

  // Handle table sorting
  const handleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Sort table data
  const sortedData = [...data].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;
    
    switch (sortColumn) {
      case 'name':
        return sortDirection === 'desc' 
          ? b.dimension_value.localeCompare(a.dimension_value)
          : a.dimension_value.localeCompare(b.dimension_value);
      case 'current_revenue':
        aValue = a.current_revenue;
        bValue = b.current_revenue;
        break;
      case 'compare_revenue':
        aValue = a.compare_revenue;
        bValue = b.compare_revenue;
        break;
      case 'revenue_growth':
        aValue = a.revenue_growth_pct ?? -Infinity;
        bValue = b.revenue_growth_pct ?? -Infinity;
        break;
      case 'current_quantity':
        aValue = a.current_quantity;
        bValue = b.current_quantity;
        break;
      case 'compare_quantity':
        aValue = a.compare_quantity;
        bValue = b.compare_quantity;
        break;
      case 'quantity_growth':
        aValue = a.quantity_growth_pct ?? -Infinity;
        bValue = b.quantity_growth_pct ?? -Infinity;
        break;
      default:
        return 0;
    }
    
    return sortDirection === 'desc' ? (bValue as number) - (aValue as number) : (aValue as number) - (bValue as number);
  });

  const SortIcon = ({ column }: { column: typeof sortColumn }) => {
    if (sortColumn !== column) return <ChevronsUpDown style={{ width: '12px', height: '12px', marginLeft: '4px', opacity: 0.4 }} />;
    return sortDirection === 'desc' 
      ? <ChevronDown style={{ width: '12px', height: '12px', marginLeft: '4px' }} />
      : <ChevronUp style={{ width: '12px', height: '12px', marginLeft: '4px' }} />;
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '0.75rem', 
      overflow: 'hidden',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ padding: '1.25rem', borderBottom: '1px solid #e5e7eb' }}>
        {/* Title */}
        <h3 style={{ 
          fontSize: '0.875rem', 
          fontWeight: 700, 
          color: '#111827', 
          textTransform: 'uppercase', 
          letterSpacing: '0.05em',
          margin: 0,
          marginBottom: '0.75rem'
        }}>
          Detailed Breakdown by {dimension}
        </h3>
        
        {/* Dimension Filter Multi-Select Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              backgroundColor: 'white',
              border: '1px solid #14b8a6',
              borderRadius: '0.375rem',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: '#14b8a6',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0fdfa'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            <span>Filter {dimension}</span>
            <ChevronDown style={{ width: '14px', height: '14px' }} />
          </button>

          {isDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '0.25rem',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              zIndex: 1000,
              width: '250px',
              height: '400px',
              display: 'flex',
              flexDirection: 'column'
            }}
            >
              {/* Select All / Clear All */}
              <div style={{ 
                padding: '0.5rem', 
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                gap: '0.5rem',
                position: 'sticky',
                top: 0,
                backgroundColor: 'white',
                zIndex: 1,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <button
                  onClick={selectAllDimensionValues}
                  style={{
                    flex: 1,
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.7rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem',
                    backgroundColor: 'white',
                    color: '#6b7280',
                    cursor: 'pointer'
                  }}
                >
                  Select All
                </button>
                <button
                  onClick={clearAllDimensionValues}
                  style={{
                    flex: 1,
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.7rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem',
                    backgroundColor: 'white',
                    color: '#6b7280',
                    cursor: 'pointer'
                  }}
                >
                  Clear All
                </button>
              </div>

              {/* Dimension Value List */}
              <div style={{ 
                padding: '0.25rem',
                flex: '1 1 auto',
                overflowY: 'scroll',
                overflowX: 'hidden'
              }}
              className="custom-scrollbar"
              >
                {sortedDimensionValues.map(value => (
                  <label
                    key={value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.5rem 0.75rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      borderRadius: '0.25rem',
                      transition: 'background-color 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDimensionValues.includes(value)}
                      onChange={() => toggleDimensionValue(value)}
                      style={{
                        width: '14px',
                        height: '14px',
                        marginRight: '0.5rem',
                        cursor: 'pointer',
                        accentColor: '#14b8a6'
                      }}
                    />
                    <span style={{ color: '#374151' }}>{value}</span>
                  </label>
                ))}
              </div>
              
              {/* Footer info */}
              {sortedDimensionValues.length > 5 && (
                <div style={{
                  padding: '0.5rem',
                  borderTop: '1px solid #e5e7eb',
                  fontSize: '0.65rem',
                  color: '#9ca3af',
                  textAlign: 'center',
                  position: 'sticky',
                  bottom: 0,
                  backgroundColor: 'white'
                }}>
                  {sortedDimensionValues.length} {dimension}s total - scroll for more
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div style={{ 
        overflowX: 'auto', 
        overflowY: 'auto', 
        maxHeight: '600px' 
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th 
                onClick={() => handleSort('name')}
                style={{ 
                  padding: '0.75rem 1rem', 
                  textAlign: 'left', 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  color: '#6b7280', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {dimension}
                  <SortIcon column="name" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('current_revenue')}
                style={{ 
                  padding: '0.75rem 1rem', 
                  textAlign: 'right', 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  color: '#6b7280', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
                  Rev ({currentLabel})
                  <SortIcon column="current_revenue" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('compare_revenue')}
                style={{ 
                  padding: '0.75rem 1rem', 
                  textAlign: 'right', 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  color: '#6b7280', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
                  Rev ({compareLabel})
                  <SortIcon column="compare_revenue" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('revenue_growth')}
                style={{ 
                  padding: '0.75rem 1rem', 
                  textAlign: 'right', 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  color: '#6b7280', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
                  Rev Growth
                  <SortIcon column="revenue_growth" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('current_quantity')}
                style={{ 
                  padding: '0.75rem 1rem', 
                  textAlign: 'right', 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  color: '#6b7280', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
                  Qty ({currentLabel})
                  <SortIcon column="current_quantity" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('compare_quantity')}
                style={{ 
                  padding: '0.75rem 1rem', 
                  textAlign: 'right', 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  color: '#6b7280', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
                  Qty ({compareLabel})
                  <SortIcon column="compare_quantity" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('quantity_growth')}
                style={{ 
                  padding: '0.75rem 1rem', 
                  textAlign: 'right', 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  color: '#6b7280', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
                  Qty Growth
                  <SortIcon column="quantity_growth" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr 
                key={row.dimension_value}
                style={{ 
                  borderBottom: index < sortedData.length - 1 ? '1px solid #f3f4f6' : 'none',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '0.875rem 1rem', fontWeight: 500, fontSize: '0.875rem', color: '#111827' }}>
                  {row.dimension_value}
                </td>
                <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontSize: '0.875rem', color: '#111827', fontFamily: 'monospace' }}>
                  {formatRevenue(row.current_revenue)}
                </td>
                <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>
                  {formatRevenue(row.compare_revenue)}
                </td>
                <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                  <GrowthBadge value={row.revenue_growth_pct} />
                </td>
                <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontSize: '0.875rem', color: '#111827', fontFamily: 'monospace' }}>
                  {formatNumber(row.current_quantity)}
                </td>
                <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>
                  {formatNumber(row.compare_quantity)}
                </td>
                <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                  <GrowthBadge value={row.quantity_growth_pct} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
