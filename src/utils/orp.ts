/**
 * Optimal Reading Position (ORP) calculation utilities
 */

import type { WordData } from '../types/rsvp';

/**
 * Calculate Optimal Reading Position (ORP) anchor character index
 * ORP is typically around 1/3 from the start of the word
 * 
 * @param word - The word to calculate ORP for
 * @returns The index of the anchor character (0-based)
 */
export function calculateORP(word: string): number {
  if (word.length === 0) return 0;
  if (word.length <= 3) return Math.floor(word.length / 2);
  // ORP is typically at 1/3 of the word length, but at least at position 1
  return Math.max(1, Math.floor(word.length / 3));
}

/**
 * Calculate punctuation multiplier for micro-pauses
 * This creates perceived smoothness by slowing down on punctuation
 */
export function getPunctuationMultiplier(word: string): number {
  const lastChar = word[word.length - 1];
  if (lastChar === '.' || lastChar === '!' || lastChar === '?') {
    return 1.3; // 30% longer pause for sentence endings
  }
  if (lastChar === ',' || lastChar === ';' || lastChar === ':') {
    return 1.15; // 15% longer pause for commas
  }
  return 1.0; // No pause for regular words
}

/**
 * Preprocessed word data with duration and pre-calculated offsets
 * All computation done before playback - zero work during playback
 */
export interface PreprocessedWord extends WordData {
  duration: number; // Duration in milliseconds
  beforeText: string; // Text before anchor (pre-split)
  anchorChar: string; // Anchor character (pre-split)
  afterText: string; // Text after anchor (pre-split)
  beforeOffset: number; // Pre-calculated offset for before text (in pixels)
  afterOffset: number; // Pre-calculated offset for after text (in pixels)
}

/**
 * Calculate character width for monospace font
 * In monospace fonts, character width is approximately 0.6 * fontSize
 * This is a close approximation that works for most monospace fonts
 * 
 * @param fontSize - Font size in rem (will be converted to pixels)
 * @returns Character width in pixels
 */
function calculateMonospaceCharWidth(fontSize: number): number {
  // Convert rem to pixels (assuming 16px base)
  const fontSizePx = fontSize * 16;
  // Monospace character width is typically ~0.6 * fontSize
  return fontSizePx * 0.6;
}

/**
 * Split text into words and calculate anchor positions
 * Preprocess everything including durations and offsets
 * Zero computation needed during playback - just index increment
 * 
 * @param text - The text to process
 * @param baseWpm - Base words per minute
 * @param fontSize - Font size in rem (default 8rem for calculation)
 * @returns Array of preprocessed WordData objects with all data ready
 */
export function processText(text: string, baseWpm: number = 300, fontSize: number = 8): readonly PreprocessedWord[] {
  // Split by whitespace and filter out empty strings
  const words = text.split(/\s+/).filter((word: string): boolean => word.length > 0);
  const baseDuration = (60 / baseWpm) * 1000;

  // Calculate character width once (monospace font)
  const charWidth = calculateMonospaceCharWidth(fontSize);
  const anchorCharWidth = charWidth; // In monospace, all chars same width

  return words.map((word: string): PreprocessedWord => {
    const trimmed = word.trim();
    const anchorIndex = calculateORP(trimmed);
    const multiplier = getPunctuationMultiplier(trimmed);

    // Pre-split word into three parts
    const beforeText = trimmed.slice(0, anchorIndex);
    const anchorChar = trimmed[anchorIndex] || '';
    const afterText = trimmed.slice(anchorIndex + 1);

    // Pre-calculate offsets (no measurement needed during playback!)
    // Anchor is centered at 50% with translateX(-50%)
    // Before text needs to shift left by anchorWidth/2
    const beforeOffset = -(anchorCharWidth / 2);
    // After text needs to shift right by anchorWidth/2
    const afterOffset = anchorCharWidth / 2;

    return {
      word: trimmed,
      anchorIndex: anchorIndex,
      duration: baseDuration * multiplier,
      beforeText: beforeText,
      anchorChar: anchorChar,
      afterText: afterText,
      beforeOffset: beforeOffset,
      afterOffset: afterOffset
    };
  });
}

/**
 * Calculate the base interval in milliseconds based on words per minute
 * Note: This is used for duration calculation during preprocessing.
 * Actual playback uses requestAnimationFrame with time delta, not intervals.
 * 
 * @param wpm - Words per minute
 * @returns Base interval in milliseconds (before punctuation multipliers)
 */
export function calculateIntervalMs(wpm: number): number {
  return (60 / wpm) * 1000;
}
