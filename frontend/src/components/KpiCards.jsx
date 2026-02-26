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
}

const cardStyle = {
  padding: "16px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  minWidth: "200px"
};

export default KpiCards;