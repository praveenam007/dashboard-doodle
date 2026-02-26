import { useEffect, useState } from "react";
import { fetchGrowthMetrics } from "./api/metrics";
import KpiCards from "./components/kpicards";
import "./App.css";

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchGrowthMetrics({
      groupBy: "channel",
      startMonth: "2025-01",
      endMonth: "2025-12",
    }).then(setData);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Revenue Performance Dashboard</h2>
      <KpiCards data={data} />
      <pre>{JSON.stringify(data.slice(0, 5), null, 2)}</pre>
    </div>
  );
}

export default App;