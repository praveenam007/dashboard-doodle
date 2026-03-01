import { useState, useRef, useEffect } from "react";
import { Layers } from "lucide-react";

interface HierarchySelectorProps {
  value: string;
  onChange: (value: string) => void;
  groupCount?: number;
}

const HIERARCHIES = [
  { value: "zone", label: "Zone" },
  { value: "state", label: "State" },
  { value: "channel", label: "Channel" },
  { value: "category", label: "Category" },
  { value: "sub_category", label: "Sub Category" },
  { value: "segment", label: "Segment" },
];

export function HierarchySelector({ value, onChange, groupCount }: HierarchySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (hierarchyValue: string) => {
    onChange(hierarchyValue);
    setIsOpen(false);
  };

  const selectedLabel = HIERARCHIES.find(h => h.value === value)?.label || value;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div ref={containerRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
          <Layers style={{ width: '16px', height: '16px' }} />
          <span>Group by</span>
        </div>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            minWidth: '140px',
            backgroundColor: 'white',
            border: '1px solid #0d9488',
            fontSize: '0.875rem',
            color: '#111827',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            outline: 'none',
            transition: 'all 0.2s'
          }}
        >
          <span>{selectedLabel}</span>
          <svg
            style={{ 
              width: '14px', 
              height: '14px', 
              opacity: 0.5, 
              flexShrink: 0, 
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
              transition: 'transform 0.2s' 
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '5.5rem',
              marginTop: '0.25rem',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
              zIndex: 9999,
              minWidth: '140px',
              overflow: 'hidden'
            }}
          >
            {HIERARCHIES.map((hierarchy) => {
              const isSelected = hierarchy.value === value;
              
              return (
                <div
                  key={hierarchy.value}
                  onClick={() => handleSelect(hierarchy.value)}
                  style={{
                    padding: '0.625rem 1rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#f0fdfa' : 'transparent',
                    borderBottom: '1px solid #f3f4f6',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    color: isSelected ? '#0d9488' : '#111827',
                    fontWeight: isSelected ? 600 : 400
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {hierarchy.label}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
