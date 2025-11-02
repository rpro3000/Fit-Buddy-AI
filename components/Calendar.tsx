
import React, { useRef, useEffect } from 'react';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface CalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateChange }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const dates = Array.from({ length: 15 }).map((_, i) => {
    const offset = i - 7;
    return addDays(selectedDate, offset);
  });

  useEffect(() => {
    if (scrollContainerRef.current) {
      const centerIndex = 7;
      const targetItem = scrollContainerRef.current.children[centerIndex] as HTMLElement;
      if (targetItem) {
          const containerWidth = scrollContainerRef.current.offsetWidth;
          const itemWidth = targetItem.offsetWidth;
          const scrollLeft = targetItem.offsetLeft - (containerWidth / 2) + (itemWidth / 2);
          scrollContainerRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [selectedDate]);


  return (
    <div className="w-full">
        <div ref={scrollContainerRef} className="flex space-x-3 overflow-x-auto py-2 no-scrollbar">
            {dates.map((date, index) => {
                const isSelected = isSameDay(date, selectedDate);
                return (
                    <button 
                        key={index}
                        onClick={() => onDateChange(date)}
                        className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-20 rounded-xl transition-all duration-200 ${isSelected ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                    >
                        <span className="text-sm font-medium uppercase">{format(date, 'E', { locale: enUS })}</span>
                        <span className="text-2xl font-bold">{format(date, 'd')}</span>
                    </button>
                )
            })}
        </div>
    </div>
  );
};

export default Calendar;
