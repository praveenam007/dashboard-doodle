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
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: '#6b7280' }}>
        <Calendar style={{ width: '12px', height: '12px' }} />
        <span>{label}</span>
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger style={{ 
          width: '120px', 
          backgroundColor: 'white', 
          border: '1px solid #d1d5db', 
          fontSize: '0.75rem', 
          color: '#111827', 
          padding: '0.375rem 0.5rem', 
          height: 'auto',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          borderRadius: '0.375rem'
        }}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent style={{ backgroundColor: 'white', zIndex: 9999, border: '1px solid #d1d5db', minWidth: '200px', borderRadius: '0.5rem' }}>
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
