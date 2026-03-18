# Neon Tic-Tac-Toe Arcade

A dynamic, fully responsive Tic-Tac-Toe web application featuring an immersive retro-arcade neon aesthetic, built entirely with core frontend web technologies (HTML5, CSS3, Vanilla JavaScript) and the browser's native Web Audio API.

## 🚀 Features
- **Neon UI/UX Design**: Sleek glassy containers, hover animations, responsive flexing grids, and highly stylized magenta/cyan box shadows.
- **Dynamic Score Tracking**: Real-time scoring system that locally tracks continuous match tallies for Player 1 and Player 2.
- **Interactive Visuals**: Tracks and calculates algorithmic strike-through vectors to animate a glowing win-line dynamically across the board when a player meets the win condition.
- **Arcade Synthesizer (Zero Dependencies)**: Harnesses the browser's native Web Audio API to schedule frequencies and manipulate chiptune waveforms (square, triangle) cleanly without needing bulky external `.mp3` files. 
- **Background Soundtracks**: Extends the audio synthesizer to let players toggle fun, nostalgic background music looping themes (Pac-Man, Mario) natively in the DOM.

## 🛠️ Technology Stack
- **HTML5**: Semantic document structuring and UI mapping.
- **CSS3**: Custom keyframe animations, DOM state-dependent transitions, UI glow handling, flexbox/grid responsive layouts.
- **Vanilla JavaScript (ES6)**: Pure, zero-dependency scripting managing the complex game loop state, win-condition matrix arrays, DOM manipulation, arrays, and `AudioContext` timeline mapping.

## 🎮 How to Play
1. Clone or download this repository to your local machine.
2. Simply open up the `public/index.html` file inside any modern web browser (Chrome, Edge, Safari, Firefox).
3. No backend servers (`Node`, `Python`, etc.) or downloads are required. Just click to play!
