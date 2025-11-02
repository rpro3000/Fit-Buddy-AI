import React from 'react';
import { useDailyLog } from '../hooks/useDailyLog';
import { format, parseISO } from 'date-fns';
import { DailyLog } from '../types';

const Progress: React.FC = () => {
  const { dailyData } = useDailyLog();

  // FIX: Cast log to DailyLog to access weight property, as Object.entries can result in an unknown type.
  const weightData = Object.entries(dailyData)
    .filter(([, log]) => (log as DailyLog).weight && (log as DailyLog).weight > 0)
    .map(([date, log]) => ({ date: parseISO(date), weight: (log as DailyLog).weight as number }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const renderChart = () => {
    if (weightData.length < 2) {
      return (
        <div className="text-center py-16 px-4 bg-white rounded-2xl shadow-md">
          <p className="text-gray-500">Not enough data to show progress.</p>
          <p className="text-sm text-gray-400 mt-1">Log your weight for at least two different days to see a chart.</p>
        </div>
      );
    }
    
    const width = 300;
    const height = 150;
    const padding = 20;

    const weights = weightData.map(d => d.weight);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const weightRange = maxWeight - minWeight === 0 ? 1 : maxWeight - minWeight;
    
    const dates = weightData.map(d => d.date);
    const minDate = Math.min(...dates.map(d=>d.getTime()));
    const maxDate = Math.max(...dates.map(d=>d.getTime()));
    const dateRange = maxDate - minDate === 0 ? 1 : maxDate - minDate;

    const points = weightData.map(d => {
        const x = ((d.date.getTime() - minDate) / dateRange) * (width - padding * 2) + padding;
        const y = height - (((d.weight - minWeight) / weightRange) * (height - padding * 2) + padding);
        return `${x},${y}`;
    }).join(' ');
    
    return (
        <div className="p-4 bg-white rounded-2xl shadow-md">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                {/* Y-Axis Labels */}
                <text x="5" y={padding - 5} fontSize="8" fill="#9ca3af">{maxWeight.toFixed(1)}kg</text>
                <text x="5" y={height - padding + 8} fontSize="8" fill="#9ca3af">{minWeight.toFixed(1)}kg</text>

                {/* Gradient */}
                <defs>
                    <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Area fill */}
                <polyline
                    fill="url(#progressGradient)"
                    points={`${padding},${height-padding} ${points} ${width-padding},${height-padding}`}
                />

                {/* Line */}
                <polyline
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                />

                {/* Points */}
                {points.split(' ').map((p, i) => {
                    const [x, y] = p.split(',');
                    return <circle key={i} cx={x} cy={y} r="3" fill="#fff" stroke="#8b5cf6" strokeWidth="1.5" />
                })}

                 {/* X-Axis Labels */}
                 <text x={padding} y={height - 5} fontSize="8" fill="#9ca3af">{format(weightData[0].date, 'MMM d')}</text>
                 <text x={width-padding} y={height-5} fontSize="8" fill="#9ca3af" textAnchor="end">{format(weightData[weightData.length-1].date, 'MMM d')}</text>
            </svg>
        </div>
    )
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>
        <p className="text-gray-500">A visual look at your journey.</p>
      </header>

      <div className="space-y-6">
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Weight Trend</h2>
            {renderChart()}
        </div>
        {/* Future sections for other metrics can be added here */}
      </div>
    </div>
  );
};

export default Progress;