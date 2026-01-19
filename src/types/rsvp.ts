/**
 * Type definitions for RSVP Reader application
 */

export interface WordData {
  readonly word: string;
  readonly anchorIndex: number;
}

export interface RSVPControlsProps {
  readonly wpm: number;
  readonly isPlaying: boolean;
  readonly isPaused: boolean;
  readonly wordsCount: number;
  readonly currentWordIndex: number;
  readonly totalWords: number;
  readonly onWpmChange: (wpm: number) => void;
  readonly onStart: () => void;
  readonly onPause: () => void;
  readonly onResume: () => void;
  readonly onStop: () => void;
  readonly onReset: () => void;
}

export interface WordDisplayProps {
  readonly word: WordData;
}

export interface TextInputProps {
  readonly value: string;
  readonly wordCount: number;
  readonly onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  readonly onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
}

export interface ProgressBarProps {
  readonly current: number;
  readonly total: number;
}

export type WPMRange = {
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly default: number;
};

export type ReadingState = 'idle' | 'playing' | 'paused';
