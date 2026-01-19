import React from 'react';
import type { ProgressBarProps } from '../types/rsvp';

/**
 * ProgressBar component showing reading progress
 * Displays current word position and visual progress bar
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const progress: number = total > 0 ? ((current + 1) / total) * 100 : 0;

  return (
    <div className="mt-6">
      <div className="flex items-center text-sm mb-2" style={{ color: '#b0b3b8', gap: '1rem' }}>
        <span>Progress</span>
        <span style={{ color: '#4fc3f7' }}>{current + 1} / {total}</span>
      </div>
      <div className="w-full rounded-full h-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{ 
            width: `${progress}%`,
            background: 'linear-gradient(to right, #4fc3f7, #9575cd)'
          } as React.CSSProperties}
        />
      </div>
    </div>
  );
};
