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

      // Apply pre-calculated offsets instantly (no measurement, no calculation)
      // Direct style manipulation is faster than React state updates
      if (preprocessedWord.beforeOffset !== undefined && preprocessedWord.afterOffset !== undefined) {
        if (visibleBeforeRef.current !== null) {
          visibleBeforeRef.current.style.transform = `translateX(${preprocessedWord.beforeOffset}px)`;
        }
        if (visibleAfterRef.current !== null) {
          visibleAfterRef.current.style.transform = `translateX(${preprocessedWord.afterOffset}px)`;
        }
      }

      // Update text content directly via DOM (instant, no React re-render)
      // Use preprocessed data - it's already split and ready
      updateTextContent(
        preprocessedWord.beforeText ?? '',
        preprocessedWord.anchorChar ?? '',
        preprocessedWord.afterText ?? ''
      );
    }
  }, [word.word, preprocessedWord.beforeText, preprocessedWord.anchorChar, preprocessedWord.afterText, preprocessedWord.beforeOffset, preprocessedWord.afterOffset]);

  const baseStyle: React.CSSProperties = {
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    fontSize: '8rem',
    fontWeight: 600,
    lineHeight: '1.2',
    height: '9.6rem',
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

  // Before text positioned to the left of center (offset applied via style in effect)
  const beforeTextStyle: React.CSSProperties = {
    ...textStyle,
    color: '#e8eaed',
    position: 'absolute',
    right: '50%',
    transform: preprocessedWord.beforeOffset !== undefined
      ? `translateX(${preprocessedWord.beforeOffset}px)`
      : 'translateX(0px)',
    textAlign: 'right'
  };

  // After text positioned to the right of center (offset applied via style in effect)
  const afterTextStyle: React.CSSProperties = {
    ...textStyle,
    color: '#e8eaed',
    position: 'absolute',
    left: '50%',
    transform: preprocessedWord.afterOffset !== undefined
      ? `translateX(${preprocessedWord.afterOffset}px)`
      : 'translateX(0px)'
  };

  return (
    <div className="rounded-xl w-full h-full flex items-center justify-center" style={{
      backgroundColor: '#252b3d',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '2rem'
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
