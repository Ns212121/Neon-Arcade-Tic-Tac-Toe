document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const currentTurnEl = document.getElementById('current-turn');
    const gameOverBanner = document.getElementById('game-over-announcement');
    const resetBtn = document.getElementById('reset-btn');
    const themeBtns = document.querySelectorAll('.theme-btn');
    const scoreXEl = document.getElementById('score-x');
    const scoreOEl = document.getElementById('score-o');
    const winningLine = document.getElementById('winning-line');

    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameOver = false;
    let winner = null;
    let scoreX = 0;
    let scoreO = 0;
    let winningComboIndex = null;

    // --- Theme Engine ---
    let themeAudioCtx = null;
    let currentTheme = null;
    let themeTimeout = null;
    let noteIndex = 0;

    const melodies = {
        got: {
            label: 'GoT', wave: 'triangle', color: '#0ff', attack: 0.3, delayCoef: 0.9,
            notes: [
                { freq: 392.00, duration: 0.5 }, { freq: 261.63, duration: 0.5 }, { freq: 311.13, duration: 0.25 }, { freq: 349.23, duration: 0.25 },
                { freq: 392.00, duration: 0.5 }, { freq: 261.63, duration: 0.5 }, { freq: 311.13, duration: 0.25 }, { freq: 349.23, duration: 0.25 },
                { freq: 293.66, duration: 1.0 }, { freq: 349.23, duration: 0.5 }, { freq: 233.08, duration: 0.5 }, { freq: 277.18, duration: 0.25 },
                { freq: 293.66, duration: 0.25 }, { freq: 349.23, duration: 0.5 }, { freq: 233.08, duration: 0.5 }, { freq: 277.18, duration: 0.25 },
                { freq: 293.66, duration: 0.25 }, { freq: 261.63, duration: 1.0 }
            ]
        },
        pacman: {
            label: 'PAC-MAN', wave: 'square', color: '#ffeb3b', attack: 0.15, delayCoef: 1.0,
            notes: [
                { freq: 493.88, duration: 0.15 }, { freq: 987.77, duration: 0.15 }, { freq: 739.99, duration: 0.15 }, { freq: 622.25, duration: 0.15 },
                { freq: 987.77, duration: 0.08 }, { freq: 739.99, duration: 0.15 }, { freq: 622.25, duration: 0.30 }, { freq: 523.25, duration: 0.15 },
                { freq: 1046.50, duration: 0.15 }, { freq: 783.99, duration: 0.15 }, { freq: 659.25, duration: 0.15 }, { freq: 1046.50, duration: 0.08 },
                { freq: 783.99, duration: 0.15 }, { freq: 659.25, duration: 0.30 }, { freq: 493.88, duration: 0.15 }, { freq: 987.77, duration: 0.15 },
                { freq: 739.99, duration: 0.15 }, { freq: 622.25, duration: 0.15 }, { freq: 987.77, duration: 0.08 }, { freq: 739.99, duration: 0.15 },
                { freq: 622.25, duration: 0.30 }, { freq: 622.25, duration: 0.08 }, { freq: 659.25, duration: 0.08 }, { freq: 698.46, duration: 0.15 },
                { freq: 698.46, duration: 0.08 }, { freq: 739.99, duration: 0.08 }, { freq: 783.99, duration: 0.15 }, { freq: 783.99, duration: 0.08 },
                { freq: 830.61, duration: 0.08 }, { freq: 880.00, duration: 0.15 }, { freq: 987.77, duration: 0.30 }
            ]
        },
        mario: {
            label: 'MARIO', wave: 'square', color: '#f44336', attack: 0.2, delayCoef: 1.0,
            notes: [
                { freq: 659.25, duration: 0.15 }, { freq: 659.25, duration: 0.15 }, { freq: 0, duration: 0.15 }, { freq: 659.25, duration: 0.15 },
                { freq: 0, duration: 0.15 }, { freq: 523.25, duration: 0.15 }, { freq: 659.25, duration: 0.15 }, { freq: 0, duration: 0.15 },
                { freq: 783.99, duration: 0.15 }, { freq: 0, duration: 0.45 }, { freq: 392.00, duration: 0.15 }, { freq: 0, duration: 0.45 }
            ]
        },
        shinchan: {
            label: 'SHINCHAN', wave: 'square', color: '#ff9800', attack: 0.1, delayCoef: 1.0,
            notes: [
                { freq: 523.25, duration: 0.1 }, { freq: 0, duration: 0.05 }, { freq: 523.25, duration: 0.1 }, { freq: 0, duration: 0.05 },
                { freq: 523.25, duration: 0.1 }, { freq: 0, duration: 0.05 }, { freq: 523.25, duration: 0.1 }, { freq: 0, duration: 0.05 },
                { freq: 523.25, duration: 0.1 }, { freq: 0, duration: 0.05 }, { freq: 523.25, duration: 0.1 }, { freq: 0, duration: 0.2 },
                
                { freq: 440.00, duration: 0.1 }, { freq: 0, duration: 0.05 }, { freq: 440.00, duration: 0.1 }, { freq: 0, duration: 0.05 },
                { freq: 440.00, duration: 0.1 }, { freq: 0, duration: 0.05 }, { freq: 440.00, duration: 0.1 }, { freq: 0, duration: 0.05 },
                { freq: 440.00, duration: 0.1 }, { freq: 0, duration: 0.05 }, { freq: 440.00, duration: 0.1 }, { freq: 0, duration: 0.2 },
                
                { freq: 392.00, duration: 0.2 }, { freq: 349.23, duration: 0.2 }, { freq: 329.63, duration: 0.2 }, { freq: 293.66, duration: 0.2 },
                { freq: 261.63, duration: 0.4 }, { freq: 0, duration: 0.4 }
            ]
        }
    };

    function playNextNote() {
        if (!currentTheme) return;
        
        if (!themeAudioCtx) {
            themeAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const themeDef = melodies[currentTheme];
        const note = themeDef.notes[noteIndex];
        
        if (note.freq > 0) {
            const osc = themeAudioCtx.createOscillator();
            const gain = themeAudioCtx.createGain();
            
            osc.type = themeDef.wave;
            osc.frequency.setValueAtTime(note.freq, themeAudioCtx.currentTime);
            
            gain.gain.setValueAtTime(0, themeAudioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(themeDef.attack, themeAudioCtx.currentTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, themeAudioCtx.currentTime + note.duration);
            
            osc.connect(gain);
            gain.connect(themeAudioCtx.destination);
            
            osc.start();
            osc.stop(themeAudioCtx.currentTime + note.duration);
        }
        
        noteIndex = (noteIndex + 1) % themeDef.notes.length;
        
        const timeToNextNote = (note.duration * 1000) * themeDef.delayCoef;
        themeTimeout = setTimeout(playNextNote, timeToNextNote);
    }

    function toggleTheme(themeName, btnElement) {
        if (currentTheme === themeName) {
            // Stop current theme
            currentTheme = null;
            btnElement.textContent = `PLAY ${melodies[themeName].label}`;
            btnElement.style.color = '';
            btnElement.style.textShadow = '';
            btnElement.style.borderColor = '';
            clearTimeout(themeTimeout);
        } else {
            // Stop old theme if playing
            if (currentTheme) {
                clearTimeout(themeTimeout);
                document.querySelectorAll('.theme-btn').forEach(btn => {
                    const t = btn.getAttribute('data-theme');
                    btn.textContent = `PLAY ${melodies[t].label}`;
                    btn.style.color = '';
                    btn.style.textShadow = '';
                    btn.style.borderColor = '';
                });
            }
            
            currentTheme = themeName;
            noteIndex = 0;
            const themeDef = melodies[themeName];
            
            btnElement.textContent = `STOP ${themeDef.label}`;
            btnElement.style.color = themeDef.color;
            btnElement.style.textShadow = `0 0 10px ${themeDef.color}`;
            btnElement.style.borderColor = themeDef.color;
            
            if (themeAudioCtx && themeAudioCtx.state === 'suspended') {
                themeAudioCtx.resume();
            }
            playNextNote();
        }
    }

    // --- Sound Engine (Web Audio API) ---
    // Initialize lazily to respect browser autoplay policies
    let audioCtx = null;

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playTone(freq, type, duration, vol=0.1) {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    }

    function playSound(action) {
        initAudio();
        switch(action) {
            case 'X':
                playTone(880, 'sine', 0.1, 0.3); // High beep
                break;
            case 'O':
                playTone(440, 'square', 0.1, 0.1); // Low boop
                break;
            case 'win':
                // Major arpeggio
                setTimeout(() => playTone(440, 'sine', 0.2, 0.2), 0);
                setTimeout(() => playTone(554, 'sine', 0.2, 0.2), 100);
                setTimeout(() => playTone(659, 'sine', 0.4, 0.2), 200);
                setTimeout(() => playTone(880, 'sine', 0.6, 0.2), 400);
                break;
            case 'draw':
                // Discordant descending
                setTimeout(() => playTone(300, 'sawtooth', 0.3, 0.1), 0);
                setTimeout(() => playTone(280, 'sawtooth', 0.3, 0.1), 200);
                setTimeout(() => playTone(250, 'sawtooth', 0.5, 0.1), 400);
                break;
            case 'reset':
                // Sweep up
                playTone(200, 'sine', 0.1, 0.1);
                setTimeout(() => playTone(400, 'sine', 0.2, 0.1), 100);
                break;
        }
    }
    // -------------------------------------

    const winningCombos = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    function checkWinner() {
      for (let i = 0; i < winningCombos.length; i++) {
        const combo = winningCombos[i];
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
          winningComboIndex = i;
          return board[a];
        }
      }
      if (!board.includes('')) return 'Draw';
      return null;
    }

    function updateUI() {
        // Update Board
        board.forEach((val, i) => {
            const cell = cells[i];
            
            if (val !== '' && cell.textContent === '') {
                cell.textContent = val;
                cell.className = `cell ${val.toLowerCase()}`;
                // Play move sound
                playSound(val);
            } else if (val === '') {
                cell.textContent = '';
                cell.className = 'cell';
            }
        });

        // Update Turn Indicator
        let turnName = currentPlayer === 'X' ? 'PLAYER 1 (X)' : 'PLAYER 2 (O)';
        currentTurnEl.textContent = turnName;
        currentTurnEl.className = currentPlayer === 'X' ? 'cyan' : 'magenta';

        // Check Game Over
        if (gameOver) {
            gameOverBanner.classList.remove('hidden');
            
            if (winner !== 'Draw' && winningComboIndex !== null) {
                const props = [
                  { x: 0, y: -142, rot: 0 },
                  { x: 0, y: 0, rot: 0 },
                  { x: 0, y: 142, rot: 0 },
                  { x: -142, y: 0, rot: 90 },
                  { x: 0, y: 0, rot: 90 },
                  { x: 142, y: 0, rot: 90 },
                  { x: 0, y: 0, rot: 45, diag: true },
                  { x: 0, y: 0, rot: -45, diag: true }
                ][winningComboIndex];
                
                let lineColor = winner === 'X' ? '#0ff' : '#f0f';
                winningLine.style.backgroundColor = lineColor;
                winningLine.style.boxShadow = `0 0 15px ${lineColor}, 0 0 30px ${lineColor}`;
                winningLine.style.transform = `translate(calc(-50% + ${props.x}px), calc(-50% + ${props.y}px)) rotate(${props.rot}deg)`;
                
                setTimeout(() => {
                    winningLine.style.width = props.diag ? '440px' : '400px';
                }, 50);
            }

            if (winner === 'Draw') {
                playSound('draw');
            } else {
                playSound('win');
            }

            setTimeout(() => {
                if (winner === 'Draw') {
                    gameOverBanner.textContent = 'DRAW!';
                    gameOverBanner.className = 'show'; // clear colors
                    gameOverBanner.style.color = '#fff';
                    gameOverBanner.style.textShadow = '0 0 20px #fff';
                } else {
                    let winName = winner === 'X' ? 'PLAYER 1' : 'PLAYER 2';
                    gameOverBanner.textContent = `${winName} WINS!`;
                    if (winner === 'X') {
                        gameOverBanner.className = 'show cyan';
                        gameOverBanner.style.color = '';
                        gameOverBanner.style.textShadow = '';
                    } else {
                        gameOverBanner.className = 'show magenta';
                        gameOverBanner.style.color = '';
                        gameOverBanner.style.textShadow = '';
                    }
                }
            }, 50); // Small delay to trigger CSS transition
        } else {
            gameOverBanner.className = 'hidden';
            gameOverBanner.style.color = '';
            gameOverBanner.style.textShadow = '';
            winningLine.style.width = '0';
        }
    }

    function makeMove(index) {
        if (gameOver || board[index] !== '') {
            return;
        }

        board[index] = currentPlayer;
        winner = checkWinner();
        
        if (winner) {
            gameOver = true;
            if (winner === 'X') {
                scoreX++;
                scoreXEl.textContent = scoreX;
            } else if (winner === 'O') {
                scoreO++;
                scoreOEl.textContent = scoreO;
            }
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        }

        updateUI();
    }

    function resetGame() {
        board = ['', '', '', '', '', '', '', '', ''];
        currentPlayer = 'X';
        gameOver = false;
        winner = null;
        winningComboIndex = null;
        playSound('reset');
        updateUI();
    }

    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            const index = cell.getAttribute('data-index');
            makeMove(parseInt(index));
        });
    });

    resetBtn.addEventListener('click', resetGame);
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            toggleTheme(theme, btn);
        });
    });

    // Initial load
    updateUI();
});
