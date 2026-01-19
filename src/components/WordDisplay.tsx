import React, { useRef, useEffect } from 'react';
import type { WordDisplayProps } from '../types/rsvp';
import type { PreprocessedWord } from '../utils/orp';

/**
 * WordDisplay component showing the current word with highlighted anchor character
 * The anchor character is positioned at a fixed screen position
 * Uses three separate text elements: before anchor, anchor, and after anchor
 * All offsets pre-calculated - zero computation during playback (SwiftRead-style)
 */
export const WordDisplay: React.FC<WordDisplayProps> = ({ word }) => {
  const visibleBeforeRef = useRef<HTMLSpanElement>(null);
  const visibleAnchorRef = useRef<HTMLSpanElement>(null);
  const visibleAfterRef = useRef<HTMLSpanElement>(null);
  const previousWordRef = useRef<string>('');

  // Cast to PreprocessedWord to access pre-calculated data
  const preprocessedWord = word as PreprocessedWord;

  // Direct DOM update function (like jQuery's .html()) - instant, no React re-render
  const updateTextContent = (before: string, anchor: string, after: string): void => {
    if (visibleBeforeRef.current !== null) {
      visibleBeforeRef.current.textContent = before;
    }
    if (visibleAnchorRef.current !== null) {
      visibleAnchorRef.current.textContent = anchor;
    }
    if (visibleAfterRef.current !== null) {
      visibleAfterRef.current.textContent = after;
    }
  };

  // Update display when word changes - zero computation, just apply pre-calculated values
  // SwiftRead-style: all computation done during preprocessing, playback just applies stored data
  useEffect((): void => {
    const wordChanged = previousWordRef.current !== word.word;

    if (word.word === '') {
      updateTextContent('', '', '');
      return;
    }

    if (wordChanged) {
      previousWordRef.current = word.word;

      // Update text content directly via DOM (instant, no React re-render)
      // Use preprocessed data - it's already split and ready
      // Offsets are now handled via CSS em units that scale automatically with font size
      updateTextContent(
        preprocessedWord.beforeText ?? '',
        preprocessedWord.anchorChar ?? '',
        preprocessedWord.afterText ?? ''
      );
    }
  }, [word.word, preprocessedWord.beforeText, preprocessedWord.anchorChar, preprocessedWord.afterText]);

  const baseStyle: React.CSSProperties = {
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    fontSize: 'clamp(3rem, 8vw, 8rem)', // Responsive: scales from 3rem on mobile to 8rem on desktop
    fontWeight: 600,
    lineHeight: '1.2',
    height: 'clamp(3.6rem, 9.6vw, 9.6rem)', // Responsive height
    display: 'flex',
    alignItems: 'center',
    fontFeatureSettings: 'normal',
    textRendering: 'optimizeLegibility',
    verticalAlign: 'baseline',
    fontVariantNumeric: 'tabular-nums' // Ensures consistent number width
  };

  const textStyle: React.CSSProperties = {
    whiteSpace: 'nowrap',
    display: 'inline-block'
  };

  const visibleContainerStyle: React.CSSProperties = {
    ...baseStyle,
    whiteSpace: 'nowrap',
    opacity: 1, // Always visible
    position: 'relative'
  };

  // Anchor positioned absolutely at center
  const anchorStyle: React.CSSProperties = {
    ...textStyle,
    color: '#ffb74d',
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)' // Center anchor character itself
  };

  // Use em units for offset - scales automatically with font size
  // Character width = fontSize * 0.6, offset = charWidth / 2 = fontSize * 0.3
  // So offset should be 0.3em, which scales perfectly with any font size
  // This is much simpler and more accurate than trying to convert pre-calculated pixels
  const offsetEm = 0.3; // 30% of font size = half of character width (0.6 / 2)

  // Before text positioned to the left of center (offset applied via style in effect)
  const beforeTextStyle: React.CSSProperties = {
    ...textStyle,
    color: '#e8eaed',
    position: 'absolute',
    right: '50%',
    transform: `translateX(-${offsetEm}em)`, // Negative offset to move left
    textAlign: 'right'
  };

  // After text positioned to the right of center (offset applied via style in effect)
  const afterTextStyle: React.CSSProperties = {
    ...textStyle,
    color: '#e8eaed',
    position: 'absolute',
    left: '50%',
    transform: `translateX(${offsetEm}em)` // Positive offset to move right
  };

  return (
    <div className="rounded-xl w-full h-full flex items-center justify-center" style={{
      backgroundColor: '#252b3d',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      padding: 'clamp(1rem, 3vw, 2rem)' // Responsive: 1rem on mobile, 2rem on desktop
    }}>
      <div className="w-full overflow-hidden relative">
        <div className="flex justify-center">
          {/* Visible word elements - text and offsets updated directly via DOM */}
          <div
            className="mb-4 tracking-wide"
            style={visibleContainerStyle}
          >
            <span ref={visibleBeforeRef} style={beforeTextStyle} />
            <span ref={visibleAnchorRef} style={anchorStyle} />
            <span ref={visibleAfterRef} style={afterTextStyle} />
          </div>
        </div>
      </div>
    </div>
  );
};
