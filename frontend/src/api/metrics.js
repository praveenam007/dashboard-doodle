const API_URL = import.meta.env.VITE_API_URL;

export const fetchGrowthMetrics = async ({ groupBy, startMonth, endMonth }) => {
  const params = new URLSearchParams({
    group_by: groupBy,
    start_month: startMonth,
    end_month: endMonth,
  });

  const response = await fetch(
    `${API_URL}/metrics/growth?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch growth metrics");
  }

  return response.json();
};

export const fetchKPIMetrics = async (currentStartDate, currentEndDate, compareStartDate = null, compareEndDate = null) => {
  const params = new URLSearchParams({
    current_start_date: currentStartDate,
    current_end_date: currentEndDate,
  });
  
  if (compareStartDate && compareEndDate) {
    params.append("compare_start_date", compareStartDate);
    params.append("compare_end_date", compareEndDate);
  }

  const response = await fetch(
    `${API_URL}/metrics/kpi?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch KPI metrics");
  }

  return response.json();
};

export const fetchAvailableMonths = async () => {
  const response = await fetch(`${API_URL}/metrics/available-months`);

  if (!response.ok) {
    throw new Error("Failed to fetch available months");
  }

  const data = await response.json();
  return data.months;
};

export const fetchAvailableSegments = async () => {
  const response = await fetch(`${API_URL}/metrics/available-segments`);

  if (!response.ok) {
    throw new Error("Failed to fetch available segments");
  }

  const data = await response.json();
  return data.segments;
};

export const fetchAvailableDimensionValues = async (dimension) => {
  const params = new URLSearchParams({
    dimension: dimension
  });
  
  const response = await fetch(`${API_URL}/metrics/available-dimension-values?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch available dimension values");
  }

  const data = await response.json();
  return data.values;
};

export const fetchRevenueTrend = async (startDate = null, endDate = null, dimension = null, dimensionValues = null, granularity = "monthly") => {
  const params = new URLSearchParams();
  
  if (startDate) {
    params.append("start_date", startDate);
  }
  
  if (endDate) {
    params.append("end_date", endDate);
  }

  if (dimension) {
    params.append("dimension", dimension);
  }

  if (dimensionValues && dimensionValues.length > 0) {
    params.append("dimension_values", dimensionValues.join(","));
  }

  if (granularity) {
    params.append("granularity", granularity);
  }

  const response = await fetch(
    `${API_URL}/metrics/revenue-trend?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch revenue trend");
  }

  const result = await response.json();
  return result.data;
};

export const fetchGrowthByDimension = async (dimension, currentStartDate, currentEndDate, compareStartDate, compareEndDate, dimensionValues = null) => {
  const params = new URLSearchParams({
    dimension: dimension,
    current_start_date: currentStartDate,
    current_end_date: currentEndDate,
    compare_start_date: compareStartDate,
    compare_end_date: compareEndDate,
  });

  if (dimensionValues && dimensionValues.length > 0) {
    params.append("dimension_values", dimensionValues.join(","));
  }

  const response = await fetch(
    `${API_URL}/metrics/growth-by-dimension?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch growth by dimension");
  }

  const result = await response.json();
  return result.data;
};

export const fetchDetailedBreakdown = async (dimension, currentStartDate, currentEndDate, compareStartDate, compareEndDate, dimensionValues = null) => {
  const params = new URLSearchParams({
    dimension: dimension,
    current_start_date: currentStartDate,
    current_end_date: currentEndDate,
    compare_start_date: compareStartDate,
    compare_end_date: compareEndDate,
  });

  if (dimensionValues && dimensionValues.length > 0) {
    params.append("dimension_values", dimensionValues.join(","));
  }

  const response = await fetch(
    `${API_URL}/metrics/detailed-breakdown?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch detailed breakdown");
  }

  const result = await response.json();
  return result.data;
};