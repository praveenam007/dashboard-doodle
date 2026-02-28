import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  startDate: string; // format: YYYY-MM-DD
  endDate: string; // format: YYYY-MM-DD
  onChange: (startDate: string, endDate: string) => void;
  label: string;
  availableDates: string[]; // Array of YYYY-MM dates
}

export function DatePicker({ startDate, endDate, onChange, label, availableDates }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectingStart, setSelectingStart] = useState(true);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parse date to get year and month
  const parseDate = (dateStr: string) => {
    if (!dateStr) return { year: new Date().getFullYear(), month: new Date().getMonth() };
    const [year, month] = dateStr.split("-");
    return {
      year: parseInt(year),
      month: parseInt(month) - 1
    };
  };

  const currentDate = parseDate(startDate);
  const [viewYear, setViewYear] = useState(currentDate.year);
  const [viewMonth, setViewMonth] = useState(currentDate.month);

  // Update view when dates change
  useEffect(() => {
    if (startDate) {
      const parsed = parseDate(startDate);
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
    }
  }, [startDate]);

  // Reset temp dates when opening
  useEffect(() => {
    if (isOpen) {
      setTempStartDate(startDate);
      setTempEndDate(endDate);
      setSelectingStart(true);
    }
  }, [isOpen, startDate, endDate]);

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

  // Format date for display
  const formatDisplay = (start: string, end: string) => {
    if (!start || !end) return "";
    const [startY, startM, startD] = start.split("-");
    const [endY, endM, endD] = end.split("-");
    return `${startM}/${startD}/${startY} - ${endM}/${endD}/${endY}`;
  };

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Check if date is available (has data in that month)
  const isDateAvailable = (year: number, month: number) => {
    const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
    return availableDates.includes(yearMonth);
  };

  // Handle date click
  const handleDateClick = (day: number) => {
    const selectedDate = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    if (selectingStart) {
      setTempStartDate(selectedDate);
      setSelectingStart(false);
    } else {
      // Ensure end date is after start date
      if (selectedDate < tempStartDate) {
        setTempStartDate(selectedDate);
        setTempEndDate(tempStartDate);
      } else {
        setTempEndDate(selectedDate);
      }
      // Apply the selection
      onChange(
        selectedDate < tempStartDate ? selectedDate : tempStartDate,
        selectedDate < tempStartDate ? tempStartDate : selectedDate
      );
      setIsOpen(false);
      setSelectingStart(true);
    }
  };

  // Navigate months
  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Check if a specific date is selected
  const isDateSelected = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateStr === tempStartDate || dateStr === tempEndDate;
  };

  // Check if date is in range
  const isDateInRange = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tempStartDate && tempEndDate && dateStr >= tempStartDate && dateStr <= tempEndDate;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const monthAvailable = isDateAvailable(viewYear, viewMonth);

  // Generate calendar grid
  const calendarDays = [];
  // Empty cells for days before the first day
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} />);
  }
  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(
      <button
        key={day}
        onClick={() => monthAvailable && handleDateClick(day)}
        disabled={!monthAvailable}
        style={{
          padding: '0.5rem',
          fontSize: '0.75rem',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: monthAvailable ? 'pointer' : 'not-allowed',
          backgroundColor: isDateSelected(day) ? '#14b8a6' : 
                          isDateInRange(day) ? '#ccfbf1' : 
                          'transparent',
          color: isDateSelected(day) ? 'white' : 
                 !monthAvailable ? '#d1d5db' : 
                 '#111827',
          fontWeight: isDateSelected(day) ? 600 : 400,
          transition: 'all 0.15s'
        }}
        onMouseEnter={(e) => {
          if (monthAvailable && !isDateSelected(day)) {
            e.currentTarget.style.backgroundColor = '#f0fdfa';
          }
        }}
        onMouseLeave={(e) => {
          if (monthAvailable && !isDateSelected(day) && !isDateInRange(day)) {
            e.currentTarget.style.backgroundColor = 'transparent';
          } else if (isDateInRange(day) && !isDateSelected(day)) {
            e.currentTarget.style.backgroundColor = '#ccfbf1';
          }
        }}
      >
        {day}
      </button>
    );
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: '#6b7280' }}>
        <Calendar style={{ width: '12px', height: '12px' }} />
        <span>{label}</span>
      </div>
      
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          readOnly
          value={formatDisplay(startDate, endDate)}
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '200px',
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            fontSize: '0.7rem',
            color: '#111827',
            padding: '0.375rem 2rem 0.375rem 0.5rem',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            outline: 'none'
          }}
        />
        <Calendar
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: 'absolute',
            right: '0.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '14px',
            height: '14px',
            color: '#6b7280',
            cursor: 'pointer',
            pointerEvents: 'none'
          }}
        />
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.25rem',
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            zIndex: 9999,
            width: '300px',
            padding: '1rem'
          }}
        >
          {/* Header with navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <button
              onClick={goToPrevMonth}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ChevronLeft style={{ width: '16px', height: '16px', color: '#6b7280' }} />
            </button>
            
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>
              {monthNames[viewMonth]} {viewYear}
            </div>
            
            <button
              onClick={goToNextMonth}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ChevronRight style={{ width: '16px', height: '16px', color: '#6b7280' }} />
            </button>
          </div>

          {/* Instruction text */}
          <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.75rem', textAlign: 'center' }}>
            {selectingStart ? 'Select start date' : 'Select end date'}
          </div>

          {!monthAvailable && (
            <div style={{ 
              fontSize: '0.7rem', 
              color: '#ef4444', 
              marginBottom: '0.75rem', 
              textAlign: 'center',
              padding: '0.5rem',
              backgroundColor: '#fef2f2',
              borderRadius: '0.375rem'
            }}>
              No data available for this month
            </div>
          )}

          {/* Day headers */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: '0.25rem',
            marginBottom: '0.5rem'
          }}>
            {dayNames.map(day => (
              <div 
                key={day} 
                style={{ 
                  textAlign: 'center', 
                  fontSize: '0.7rem', 
                  fontWeight: 600,
                  color: '#6b7280',
                  padding: '0.25rem'
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: '0.25rem'
          }}>
            {calendarDays}
          </div>
        </div>
      )}
    </div>
  );
}
