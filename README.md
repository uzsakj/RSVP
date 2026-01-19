# RSVP Reader

A high-performance Rapid Serial Visual Presentation (RSVP) reader built with React, TypeScript, and Vite. This application uses an optimized architecture for smooth, frame-perfect word-by-word reading at speeds up to 1000+ words per minute.

## Features

- **Smooth Reading Experience**: Frame-perfect timing using `requestAnimationFrame` with time delta (no drift)
- **Optimal Reading Position (ORP)**: Automatically calculates and highlights the anchor character for each word
- **Adjustable Speed**: Control reading speed from 100 to 1000 words per minute
- **Punctuation Pauses**: Intelligent micro-pauses on punctuation for better comprehension
- **Preprocessing Architecture**: All computation done before playback - zero work during playback
- **Monospace Font**: Fixed-width font ensures stable anchor character positioning
- **Direct DOM Manipulation**: Instant word updates without React re-render overhead
- **Full Playback Controls**: Start, Pause, Resume, Stop, and Reset functionality
- **Progress Tracking**: Visual progress bar showing reading position

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Monospace Fonts** - Consistent character width for stable positioning

## Architecture

This project uses an optimized architecture for optimal performance:

### Preprocessing (Before Playback)
- Text is split into words
- ORP (Optimal Reading Position) is calculated for each word
- Words are pre-split into three segments: before anchor, anchor, after anchor
- Offsets are pre-calculated using monospace character width
- Durations are calculated with punctuation multipliers
- **Zero computation needed during playback**

### Playback Loop
- Uses `requestAnimationFrame` with time delta (not `setInterval`)
- Time accumulation prevents drift
- Refs used for frequently changing values to avoid React reconciliation
- Direct DOM manipulation for instant word updates
- Only index increment during playback

### Key Optimizations
1. **No Layout Recalculation**: Fixed container, fixed alignment, same DOM nodes reused
2. **No Measurement During Playback**: All offsets pre-calculated
3. **No Text Splitting During Playback**: Words pre-split during preprocessing
4. **Minimal State Updates**: Only update state when word changes, not every frame
5. **Direct DOM Updates**: Use `textContent` and `style.transform` directly via refs


## Usage

1. **Paste or Type Text**: Enter your text in the text input area
2. **Adjust Speed**: Use the WPM slider to set your desired reading speed (100-1000 WPM)
3. **Start Reading**: Click the "Start" button to begin
4. **Control Playback**: Use Pause, Resume, Stop, and Reset buttons as needed
5. **Track Progress**: Monitor your reading progress with the progress bar

## Project Structure

```
src/
├── components/
│   ├── RSVP.tsx           # Main container component with playback loop
│   ├── WordDisplay.tsx    # Word display with anchor character positioning
│   ├── RSVPControls.tsx   # WPM slider and playback controls
│   ├── TextInput.tsx      # Text input area with paste support
│   └── ProgressBar.tsx   # Reading progress indicator
├── utils/
│   └── orp.ts             # ORP calculation and text preprocessing
├── types/
│   └── rsvp.ts            # TypeScript type definitions
└── index.css              # Global styles and Tailwind directives
```

## Key Implementation Details

### Optimal Reading Position (ORP)
- ORP is calculated at approximately 1/3 from the start of each word
- For short words (≤3 characters), the anchor is at the center
- The anchor character is highlighted in orange (#ffb74d)

### Punctuation Multipliers
- Sentence endings (., !, ?): 30% longer pause
- Commas and colons (,, ;, :): 15% longer pause
- Regular words: Base duration

### Monospace Font Calculation
- Character width: ~0.6 × fontSize (for 8rem font)
- Offsets pre-calculated: `beforeOffset = -(charWidth / 2)`, `afterOffset = charWidth / 2`
- Ensures anchor character stays at fixed screen position

### Three-Segment Layout
- **Before Text**: Positioned absolutely to the left of center
- **Anchor Character**: Centered at 50% with `translateX(-50%)`
- **After Text**: Positioned absolutely to the right of center
- All segments updated via direct DOM manipulation

## Performance Characteristics

- **No Timing Drift**: Time accumulation prevents drift over long sessions
- **Minimal CPU Usage**: Zero computation during playback
- **Instant Word Updates**: Direct DOM manipulation bypasses React reconciliation

## Browser Support

Modern browsers with support for:
- `requestAnimationFrame`
- ES6+ features
- CSS transforms

## License

This project is open source and available for use.

