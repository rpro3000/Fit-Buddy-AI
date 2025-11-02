
import React from 'react';

interface NutrientTrackerProps {
  title?: string;
  value: number;
  maxValue: number;
  unit?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: React.ReactNode;
}

const NutrientTracker: React.FC<NutrientTrackerProps> = ({
  title,
  value,
  maxValue,
  unit = '',
  size = 60,
  strokeWidth = 6,
  color = 'text-blue-500',
  children
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md flex flex-col items-center justify-center text-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
          <circle
            className="text-gray-200"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className={`${color} transition-all duration-500 ease-out`}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
      </div>
      {title && <h3 className="text-sm font-semibold mt-2 text-gray-800">{title}</h3>}
      <p className="text-xs text-gray-500">
        {Math.round(value)}{unit} / {Math.round(maxValue)}{unit}
      </p>
    </div>
  );
};

export default NutrientTracker;
