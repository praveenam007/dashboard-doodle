import { useEffect, useState } from "react";
import { fetchKPIMetrics, fetchAvailableMonths, fetchRevenueTrend, fetchGrowthByDimension, fetchDetailedBreakdown, fetchAvailableDimensionValues } from "./api/metrics";
import KpiCards from "./components/KpiCards";
import { DatePicker } from "./components/DatePicker";
import { HierarchySelector } from "./components/HierarchySelector";
import { Charts } from "./components/Charts";
import { RevenueComparisonChart } from "./components/RevenueComparisonChart";
import { BreakdownTable } from "./components/BreakdownTable";
import { Calendar } from "lucide-react";
import "./App.css";

function formatMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function App() {
  const [kpiData, setKpiData] = useState(null);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [currentStartDate, setCurrentStartDate] = useState<string>("");
  const [currentEndDate, setCurrentEndDate] = useState<string>("");
  const [compareStartDate, setCompareStartDate] = useState<string>("");
  const [compareEndDate, setCompareEndDate] = useState<string>("");
  const [dimension, setDimension] = useState<string>("category");
  const [granularity, setGranularity] = useState<string>("monthly");
  const [revenueTrendData, setRevenueTrendData] = useState<any[]>([]);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [breakdownData, setBreakdownData] = useState<any[]>([]);
  const [availableDimensionValues, setAvailableDimensionValues] = useState<string[]>([]);
  const [selectedDimensionValues, setSelectedDimensionValues] = useState<string[]>([]);

  // Fetch available months on mount
  useEffect(() => {
    fetchAvailableMonths().then((months) => {
      setAvailableMonths(months);
      if (months.length > 0) {
        // Default to March 2025 as current period
        setCurrentStartDate('2025-03-01');
        setCurrentEndDate('2025-03-31');
        
        // Default to January 2025 as compare period
        setCompareStartDate('2025-01-01');
        setCompareEndDate('2025-01-31');
      }
    });
  }, []);

  // Fetch available dimension values when dimension changes
  useEffect(() => {
    if (dimension) {
      fetchAvailableDimensionValues(dimension).then((values) => {
        console.log('Available dimension values for', dimension, ':', values, 'Count:', values.length);
        setAvailableDimensionValues(values);
        // Don't select any values by default - show all data
        setSelectedDimensionValues([]);
      });
    }
  }, [dimension]);

  // Fetch KPI data when date ranges change
  useEffect(() => {
    if (currentStartDate && currentEndDate && compareStartDate && compareEndDate) {
      fetchKPIMetrics(currentStartDate, currentEndDate, compareStartDate, compareEndDate).then(setKpiData);
    }
  }, [currentStartDate, currentEndDate, compareStartDate, compareEndDate]);

  // Fetch revenue trend data
  useEffect(() => {
    if (currentStartDate && currentEndDate) {
      fetchRevenueTrend(currentStartDate, currentEndDate, dimension, selectedDimensionValues, granularity).then(setRevenueTrendData);
    }
  }, [dimension, currentStartDate, currentEndDate, selectedDimensionValues, granularity]);

  // Fetch growth by dimension data when dimension or date ranges change
  useEffect(() => {
    if (currentStartDate && currentEndDate && compareStartDate && compareEndDate) {
      fetchGrowthByDimension(dimension, currentStartDate, currentEndDate, compareStartDate, compareEndDate, selectedDimensionValues).then(setGrowthData);
    }
  }, [dimension, currentStartDate, currentEndDate, compareStartDate, compareEndDate, selectedDimensionValues]);
  
  // Fetch breakdown data when dimension, date ranges, or dimension values change
  useEffect(() => {
    if (currentStartDate && currentEndDate && compareStartDate && compareEndDate) {
      fetchDetailedBreakdown(dimension, currentStartDate, currentEndDate, compareStartDate, compareEndDate, selectedDimensionValues).then(setBreakdownData);
    }
  }, [dimension, currentStartDate, currentEndDate, compareStartDate, compareEndDate, selectedDimensionValues]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '1rem' }}>
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 100 }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ padding: '0.5rem', backgroundColor: '#0d9488', borderRadius: '0.5rem' }}>
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Revenue Performance</h1>
            </div>
          </div>

          {/* Date Pickers */}
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', position: 'relative', zIndex: 100 }}>
            <DatePicker
              availableDates={availableMonths}
              startDate={currentStartDate}
              endDate={currentEndDate}
              onChange={(start, end) => {
                setCurrentStartDate(start);
                setCurrentEndDate(end);
              }}
              label="Current"
            />
            <DatePicker
              availableDates={availableMonths}
              startDate={compareStartDate}
              endDate={compareEndDate}
              onChange={(start, end) => {
                setCompareStartDate(start);
                setCompareEndDate(end);
              }}
              label="Compare"
            />
          </div>
        </div>

        {/* KPI Cards */}
        <KpiCards data={kpiData} compareMonth={formatMonthLabel(compareStartDate)} />

        {/* Hierarchy Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <HierarchySelector 
            value={dimension} 
            onChange={setDimension}
            groupCount={growthData.length}
          />
        </div>

        {/* Charts */}
        <Charts 
          revenueTrendData={revenueTrendData}
          growthData={growthData}
          dimension={dimension}
          granularity={granularity}
          onGranularityChange={setGranularity}
        />

        {/* Revenue Comparison Chart */}
        <div style={{ marginTop: '1.5rem' }}>
          <RevenueComparisonChart 
            data={breakdownData}
            dimension={dimension}
            currentMonth={currentStartDate}
            compareMonth={compareStartDate}
          />
        </div>

        {/* Breakdown Table */}
        <div style={{ marginTop: '1.5rem' }}>
          <BreakdownTable 
            data={breakdownData}
            dimension={dimension}
            currentMonth={currentStartDate}
            compareMonth={compareStartDate}
            availableDimensionValues={availableDimensionValues}
            selectedDimensionValues={selectedDimensionValues}
            onDimensionValuesChange={setSelectedDimensionValues}
          />
        </div>
      </div>
    </div>
  );
}

export default App;