import React from 'react';
import type { RSVPControlsProps } from '../types/rsvp';
import { ProgressBar } from './ProgressBar';

const WPM_MIN = 100;
const WPM_MAX = 1000;
const WPM_STEP = 50;

/**
 * RSVPControls component for managing reading speed and playback controls
 * Provides WPM slider and playback buttons (Start, Pause, Resume, Stop, Reset)
 */
export const RSVPControls: React.FC<RSVPControlsProps> = ({
    wpm,
    isPlaying,
    isPaused,
    wordsCount,
    currentWordIndex,
    totalWords,
    onWpmChange,
    onStart,
    onPause,
    onResume,
    onStop,
    onReset
}) => {
    const handleWpmChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const newWpm: number = Number.parseInt(e.target.value, 10);
        if (!Number.isNaN(newWpm) && newWpm >= WPM_MIN && newWpm <= WPM_MAX) {
            onWpmChange(newWpm);
        }
    };

    return (
        <div className="rounded-xl mb-8" style={{
            backgroundColor: '#252b3d',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '1.5rem'
        }}>
            {/* WPM Control */}
            <div className="mb-6">
                <label className="block font-medium text-center" style={{ color: '#b0b3b8', marginBottom: '1.5rem', fontSize: '1.125rem' }}>
                    Words Per Minute (WPM): <span style={{ color: '#4fc3f7' }}>{wpm}</span>
                </label>
                <div className="flex justify-center">
                    <div style={{ width: '90%' }}>
                        <input
                            type="range"
                            min={WPM_MIN}
                            max={WPM_MAX}
                            step={WPM_STEP}
                            value={wpm}
                            onChange={handleWpmChange}
                            className="w-full h-2 rounded-full appearance-none cursor-pointer"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                accentColor: '#4fc3f7',
                                borderRadius: '9999px'
                            }}
                        />
                        <div className="flex justify-between text-xs mt-2" style={{ color: '#8a8d91' }}>
                            <span>{WPM_MIN}</span>
                            <span>{Math.floor((WPM_MIN + WPM_MAX) / 2)}</span>
                            <span>{WPM_MAX}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Control Buttons */}
            <div className="flex flex-wrap" style={{ margin: '1rem 0', gap: '1.25rem' }}>
                {!isPlaying && !isPaused && (
                    <button
                        onClick={onStart}
                        disabled={wordsCount === 0}
                        className="rounded-lg font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: wordsCount === 0 ? 'rgba(79, 195, 247, 0.3)' : '#4fc3f7',
                            color: '#1a1f2e',
                            fontWeight: '600',
                            padding: '0.875rem 1.75rem',
                            fontSize: '1rem'
                        }}
                        type="button"
                    >
                        Start
                    </button>
                )}
                {isPlaying && !isPaused && (
                    <button
                        onClick={onPause}
                        className="rounded-lg font-medium transition-colors"
                        style={{
                            backgroundColor: '#ffb74d',
                            color: '#1a1f2e',
                            fontWeight: '600',
                            padding: '0.875rem 1.75rem',
                            fontSize: '1rem'
                        }}
                        type="button"
                    >
                        Pause
                    </button>
                )}
                {isPaused && (
                    <button
                        onClick={onResume}
                        className="rounded-lg font-medium transition-colors"
                        style={{
                            backgroundColor: '#66bb6a',
                            color: '#1a1f2e',
                            fontWeight: '600',
                            padding: '0.875rem 1.75rem',
                            fontSize: '1rem'
                        }}
                        type="button"
                    >
                        Resume
                    </button>
                )}
                {(isPlaying || isPaused) && (
                    <button
                        onClick={onStop}
                        className="rounded-lg font-medium transition-colors"
                        style={{
                            backgroundColor: '#ef5350',
                            color: '#ffffff',
                            fontWeight: '600',
                            padding: '0.875rem 1.75rem',
                            fontSize: '1rem'
                        }}
                        type="button"
                    >
                        Stop
                    </button>
                )}
                <button
                    onClick={onReset}
                    disabled={currentWordIndex === 0}
                    className="rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: '#b0b3b8',
                        fontWeight: '600',
                        padding: '0.875rem 1.75rem',
                        fontSize: '1rem'
                    }}
                    type="button"
                >
                    Reset
                </button>
            </div>

            {/* Progress */}
            {totalWords > 0 && (
                <ProgressBar current={currentWordIndex} total={totalWords} />
            )}
        </div>
    );
};
