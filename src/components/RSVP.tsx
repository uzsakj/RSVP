import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { WordData } from '../types/rsvp';
import { processText, type PreprocessedWord } from '../utils/orp';
import { TextInput } from './TextInput';
import { RSVPControls } from './RSVPControls';
import { WordDisplay } from './WordDisplay';

const DEFAULT_WPM = 300;

/**
 * Main RSVP Reader component
 * Uses requestAnimationFrame with time delta for smooth playback (SwiftRead-style)
 */
const RSVP: React.FC = () => {
    const [text, setText] = useState<string>('');
    const [preprocessedWords, setPreprocessedWords] = useState<readonly PreprocessedWord[]>([]);
    const [currentWord, setCurrentWord] = useState<WordData | undefined>(undefined);
    const [wpm, setWpm] = useState<number>(DEFAULT_WPM);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);

    // Refs for playback loop - avoid React re-renders per frame
    // SwiftRead-style: use refs for frequently changing values to prevent reconciliation overhead
    const wordIndexRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);
    const animationFrameRef = useRef<number | null>(null);
    const wordsRef = useRef<readonly PreprocessedWord[]>([]);
    const wpmRef = useRef<number>(DEFAULT_WPM);
    const isPlayingRef = useRef<boolean>(false);
    const isPausedRef = useRef<boolean>(false);

    // Sync refs with state
    useEffect((): void => {
        wordsRef.current = preprocessedWords;
    }, [preprocessedWords]);

    useEffect((): (() => void) | void => {
        wpmRef.current = wpm;
        // Reprocess words with new WPM
        if (text) {
            const updateFrame = requestAnimationFrame((): void => {
                const processed = processText(text, wpm);
                setPreprocessedWords(processed);
            });
            return (): void => {
                cancelAnimationFrame(updateFrame);
            };
        }
    }, [wpm, text]);

    useEffect((): void => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    useEffect((): void => {
        isPausedRef.current = isPaused;
    }, [isPaused]);

    // Playback loop using requestAnimationFrame with time delta (SwiftRead-style)
    // This provides frame-perfect timing without drift, unlike setInterval/setTimeout
    useEffect((): (() => void) => {
        if (!isPlaying || isPaused || wordsRef.current.length === 0) {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            return (): void => { };
        }

        // Initialize timing
        lastTimeRef.current = performance.now();

        function loop(now: number): void {
            if (!isPlayingRef.current || isPausedRef.current) {
                animationFrameRef.current = null;
                return;
            }

            const words = wordsRef.current;
            const currentIndex = wordIndexRef.current;

            if (currentIndex >= words.length) {
                // Reached the end
                setIsPlaying(false);
                setIsPaused(false);
                animationFrameRef.current = null;
                return;
            }

            const delta = now - lastTimeRef.current;
            const currentWordData = words[currentIndex];

            if (delta >= currentWordData.duration) {
                // Time to show next word
                // Pass the entire preprocessed word (includes offsets, split text, etc.)
                // Zero computation - just pass the data
                setCurrentWord(currentWordData);
                setCurrentWordIndex(currentIndex);

                // Advance to next word
                wordIndexRef.current = currentIndex + 1;
                // Accumulate time instead of using 'now' to prevent drift
                // This ensures consistent timing even if frames are dropped or delayed
                lastTimeRef.current += currentWordData.duration;
            }

            // Continue loop
            animationFrameRef.current = requestAnimationFrame(loop);
        }

        // Start loop
        animationFrameRef.current = requestAnimationFrame(loop);

        return (): void => {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [isPlaying, isPaused]);

    // Handle text paste/input
    const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const newText: string = e.target.value;
        setText(newText);
        const processedWords = processText(newText, wpmRef.current);
        setPreprocessedWords(processedWords);
        wordIndexRef.current = 0;
        setCurrentWordIndex(0);
        setCurrentWord(undefined);
        setIsPlaying(false);
        setIsPaused(false);
    }, []);

    // Handle paste event
    const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>): void => {
        e.preventDefault();
        const pastedText: string = e.clipboardData.getData('text');
        const newText: string = text + (text ? ' ' : '') + pastedText;
        setText(newText);
        const processedWords = processText(newText, wpmRef.current);
        setPreprocessedWords(processedWords);
        wordIndexRef.current = 0;
        setCurrentWordIndex(0);
        setCurrentWord(undefined);
        setIsPlaying(false);
        setIsPaused(false);
    }, [text]);

    // Start reading
    const handleStart = useCallback((): void => {
        if (preprocessedWords.length === 0) return;
        if (wordIndexRef.current >= preprocessedWords.length) {
            wordIndexRef.current = 0;
            setCurrentWordIndex(0);
        }
        setIsPlaying(true);
        setIsPaused(false);
    }, [preprocessedWords.length]);

    // Pause reading
    const handlePause = useCallback((): void => {
        setIsPaused(true);
        setIsPlaying(false);
    }, []);

    // Resume reading
    const handleResume = useCallback((): void => {
        if (preprocessedWords.length === 0 || wordIndexRef.current >= preprocessedWords.length) {
            wordIndexRef.current = 0;
            setCurrentWordIndex(0);
        }
        setIsPlaying(true);
        setIsPaused(false);
    }, [preprocessedWords.length]);

    // Stop reading
    const handleStop = useCallback((): void => {
        setIsPlaying(false);
        setIsPaused(false);
        wordIndexRef.current = 0;
        setCurrentWordIndex(0);
        setCurrentWord(undefined);
    }, []);

    // Reset to beginning
    const handleReset = useCallback((): void => {
        handleStop();
        wordIndexRef.current = 0;
        setCurrentWordIndex(0);
    }, [handleStop]);

    // Handle WPM change
    const handleWpmChange = useCallback((newWpm: number): void => {
        setWpm(newWpm);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex flex-col overflow-auto" style={{
            backgroundColor: '#1a1f2e',
            color: '#e8eaed',
            margin: 0,
            width: '100vw',
            height: '100vh',
            padding: '2rem'
        }}>
            <div className="w-full flex flex-col flex-1 min-w-0" style={{ maxWidth: '100%' }}>
                <h1 className="text-4xl font-bold text-center mb-8" style={{
                    color: '#e8eaed',
                    letterSpacing: '-0.02em'
                }}>
                    RSVP Reader
                </h1>

                <div className="flex-shrink-0" style={{ padding: '0 1.5rem' }}>
                    <TextInput
                        value={text}
                        wordCount={preprocessedWords.length}
                        onTextChange={handleTextChange}
                        onPaste={handlePaste}
                    />

                    <RSVPControls
                        wpm={wpm}
                        isPlaying={isPlaying}
                        isPaused={isPaused}
                        wordsCount={preprocessedWords.length}
                        currentWordIndex={currentWordIndex}
                        totalWords={preprocessedWords.length}
                        onWpmChange={handleWpmChange}
                        onStart={handleStart}
                        onPause={handlePause}
                        onResume={handleResume}
                        onStop={handleStop}
                        onReset={handleReset}
                    />
                </div>

                {/* Word Display Area */}
                <div className="flex-1 flex items-center justify-center min-h-0" style={{ padding: '0 1.5rem' }}>
                    {currentWord !== undefined && (isPlaying || isPaused) ? (
                        <WordDisplay word={currentWord} />
                    ) : (
                        <div className="rounded-xl p-8 text-center w-full" style={{
                            backgroundColor: '#252b3d',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            color: '#b0b3b8'
                        }}>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RSVP;
