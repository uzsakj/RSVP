import React from 'react';
import type { TextInputProps } from '../types/rsvp';

/**
 * TextInput component for pasting and typing text to be read
 * Supports paste events and displays word count
 */
export const TextInput: React.FC<TextInputProps> = ({ value, wordCount, onTextChange, onPaste }) => {
  return (
    <div className="mb-8" style={{ padding: '0 0.5rem' }}>
      <label className="block font-medium text-left text-sm sm:text-base md:text-lg" style={{ color: '#b0b3b8', marginBottom: '1.5rem', fontSize: 'clamp(0.875rem, 2vw, 1.125rem)' }}>
        Paste or type your text here
      </label>
      <textarea
        value={value}
        onChange={onTextChange}
        onPaste={onPaste}
        placeholder="Paste your text here and click Start to begin reading..."
        className="w-full rounded-xl resize-none focus:outline-none transition-all text-sm sm:text-base"
        style={{
          backgroundColor: '#252b3d',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          color: '#e8eaed',
          fontSize: '16px',
          lineHeight: '1.6',
          minHeight: 'clamp(150px, 25vh, 200px)', // Responsive: smaller on mobile
          height: 'clamp(180px, 30vh, 250px)', // Responsive: smaller on mobile
          padding: 'clamp(0.875rem, 2vw, 1.25rem)' // Responsive: 0.875rem on mobile, 1.25rem on desktop
        }}
        onFocus={(e): void => {
          e.target.style.borderColor = 'rgba(79, 195, 247, 0.4)';
        }}
        onBlur={(e): void => {
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        }}
      />
      <p className="text-sm mt-3" style={{ color: '#8a8d91' }}>
        {wordCount} {wordCount === 1 ? 'word' : 'words'} ready
      </p>
    </div>
  );
};
