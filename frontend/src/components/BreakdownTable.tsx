import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { HierarchyBreakdown } from "@/lib/dashboard-data";
import { formatINR, formatNumber } from "@/lib/dashboard-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BreakdownTableProps {
  data: HierarchyBreakdown[];
  dimensionLabel: string;
  currentLabel: string;
  previousLabel: string;
}

function GrowthBadge({ value }: { value: number }) {
  const isPositive = value > 0;
  const isNegative = value < 0;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
        isPositive
          ? "text-chart-positive bg-chart-positive/10"
          : isNegative
          ? "text-chart-negative bg-chart-negative/10"
          : "text-muted-foreground bg-muted"
      }`}
    >
      {isPositive ? <TrendingUp className="w-3 h-3" /> : isNegative ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
      {isPositive ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

export function BreakdownTable({ data, dimensionLabel, currentLabel, previousLabel }: BreakdownTableProps) {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-5 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Detailed Breakdown by {dimensionLabel}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">{dimensionLabel}</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground text-right">Rev ({currentLabel})</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground text-right">Rev ({previousLabel})</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground text-right">Rev Growth</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground text-right">Qty ({currentLabel})</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground text-right">Qty ({previousLabel})</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground text-right">Qty Growth</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.dimension} className="border-border hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium text-sm">{row.dimension}</TableCell>
                <TableCell className="text-right font-mono text-sm">{formatINR(row.currentRevenue)}</TableCell>
                <TableCell className="text-right font-mono text-sm text-muted-foreground">{formatINR(row.previousRevenue)}</TableCell>
                <TableCell className="text-right"><GrowthBadge value={row.growthPct} /></TableCell>
                <TableCell className="text-right font-mono text-sm">{formatNumber(row.currentQty)}</TableCell>
                <TableCell className="text-right font-mono text-sm text-muted-foreground">{formatNumber(row.previousQty)}</TableCell>
                <TableCell className="text-right"><GrowthBadge value={row.qtyGrowthPct} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
