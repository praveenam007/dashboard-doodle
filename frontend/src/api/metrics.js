const API_BASE = "http://127.0.0.1:8000";

export const fetchGrowthMetrics = async ({ groupBy, startMonth, endMonth }) => {
  const params = new URLSearchParams({
    group_by: groupBy,
    start_month: startMonth,
    end_month: endMonth,
  });

  const response = await fetch(
    `${API_BASE}/metrics/growth?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch growth metrics");
  }

  return response.json();
};