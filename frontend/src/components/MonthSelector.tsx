import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";
import type { MonthlyAggregate } from "@/lib/dashboard-data";

interface MonthSelectorProps {
  months: MonthlyAggregate[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export function MonthSelector({ months, value, onChange, label }: MonthSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Calendar className="w-3.5 h-3.5" />
        <span>{label}</span>
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[150px] bg-card border-border text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {months.map((m) => (
            <SelectItem key={m.month} value={m.month}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
