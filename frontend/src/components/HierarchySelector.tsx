import { HIERARCHY_DIMENSIONS, type HierarchyKey } from "@/lib/dashboard-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layers } from "lucide-react";

interface HierarchySelectorProps {
  value: HierarchyKey;
  onChange: (value: HierarchyKey) => void;
}

export function HierarchySelector({ value, onChange }: HierarchySelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Layers className="w-4 h-4" />
        <span>Group by</span>
      </div>
      <Select value={value} onValueChange={(v) => onChange(v as HierarchyKey)}>
        <SelectTrigger className="w-[200px] bg-card border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {HIERARCHY_DIMENSIONS.map((dim) => (
            <SelectItem key={dim.key} value={dim.key}>
              {dim.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
