'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Game Configuration ---
const RAPID_LINES = {
    FALLBACK_DIFFICULTY: 50,
    FALLBACK_NUM_LINES: 4,
    ZONE_FROM_RIGHT: 90,
    ZONE: { MIN: 10, MAX: 25 },
    // MODIFIED: Reduced duration to increase speed
    DURATION: { MIN: 1000, MAX: 2500 },
};

const KEYS = {
    Primary: 'E',
};

// --- Helper Functions ---
function delay(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
}

// --- Type Definitions ---
type TLineState = 'success' | 'fail' | null;
interface TLine {
    id: string;
    state: TLineState;
    duration: number;
    delay: number;
}
interface TRapidLinesState {
    lines: TLine[];
    zoneWidth: number;
}
interface TKeyGameParam {
    difficulty: number;
    numberOfKeys: number;
}


// --- Styles ---
const GameStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
        .rapidlines-container {
            --background: 0 0 0;
            --foreground: 250 247 255;
            --primary: 37 37 37;
            --secondary: 60 60 60;
            --tertiary: 250 247 255;
            --accent: 134 133 239;
            --success: 102 231 138;
            --error: 229 40 62;
            font-family: "Roboto", sans-serif;
        }
        .rapidlines-container * {
            color: rgb(var(--foreground));
            font-family: "Roboto", sans-serif;
        }
        .rapidlines-container .bg-primary { background-color: rgb(var(--primary)); }
        .rapidlines-container .text-muted { color: rgba(var(--foreground), 0.7); }
        .rapidlines-container .btn-accent { background-color: rgb(var(--accent)); transition: background-color 0.2s; }
        .rapidlines-container .btn-accent:hover { background-color: rgba(var(--accent), 0.8); }
        .rapidlines-container .bg-tertiary { background-color: rgb(var(--tertiary)); }
        .rapidlines-container .glow-accent { filter: drop-shadow(0 0 0.3vw rgb(var(--accent))); }
        .rapidlines-container .glow-success { filter: drop-shadow(0 0 0.3vw rgb(var(--success))); }
        .rapidlines-container .glow-error { filter: drop-shadow(0 0 0.3vw rgb(var(--error))); }
        .rapidlines-container .bg-accent { background-color: rgb(var(--accent)); }
        .rapidlines-container .bg-success { background-color: rgb(var(--success)); }
        .rapidlines-container .bg-error { background-color: rgb(var(--error)); }
        .rapidlines-container .primary-shadow { box-shadow: 0 0 2vw 0.05vw rgba(0, 0, 0, 0.75); }
        .rapidlines-container .text-shadow { text-shadow: 0 0 0.3vw rgba(0, 0, 0, 0.75); }
        .rapidlines-container .default-colour-transition { transition: background-color 0.2s, filter 0.2s; }
    `}</style>
);


// --- Reusable Line Component ---
const Line: React.FC<TLine & { onPositionUpdate: (id: string, position: number) => void }> = ({
    id, state, duration, delay, onPositionUpdate
}) => {
    const getBgClass = () => {
        switch (state) {
            case 'success': return 'bg-success glow-success';
            case 'fail': return 'bg-error glow-error';
            default: return 'bg-tertiary primary-shadow';
        }
    };

    return (
        <motion.div
            initial={{ left: '0%' }}
            animate={{
                left: '100%',
                opacity: state !== null ? 0 : 1,
            }}
            transition={{
                left: { duration: duration / 1000, delay: delay / 1000, ease: 'linear' },
                opacity: { duration: 0.2, delay: 0.1 },
            }}
            onUpdate={(latest) => onPositionUpdate(id, parseFloat(latest.left as string))}
            style={{ width: '0.5vw' }}
            className={`grid place-items-center z-10 absolute h-[1vw] default-colour-transition ${getBgClass()}`}
        />
    );
};

// --- Main Game Component ---
export default function RapidLines() {
    const [gameState, setGameState] = useState<TRapidLinesState | null>(null);
    const [showConfig, setShowConfig] = useState(true);
    const [gameStatus, setGameStatus] = useState<"playing" | "success" | "fail" | null>(null);
    
    const [speed, setSpeed] = useState(50); // New: speed variable
    const [zoneSize, setZoneSize] = useState(50); // New: zone size variable
    const [numberOfLines, setNumberOfLines] = useState(1);
    
    const linePositionsRef = useRef<Map<string, number>>(new Map());
    const gameLogicRef = useRef({
        isEnded: false,
        keyListener: (e: KeyboardEvent) => {}
    });

    const handleGameEnd = useCallback((success: boolean) => {
        setGameStatus(success ? "success" : "fail");
        setTimeout(() => {
            setGameState(null);
            setGameStatus(null);
            setShowConfig(true);
        }, 1500);
    }, []);
    
    const handlePositionUpdate = useCallback((lineId: string, position: number) => {
        linePositionsRef.current.set(lineId, position);
    }, []);

    // --- 💡 REFACTORED GAME LOGIC ---
    useEffect(() => {
        if (gameStatus !== 'playing' || !gameState) return;

        gameLogicRef.current.isEnded = false;
        
        const zoneRange = {
            max: RAPID_LINES.ZONE_FROM_RIGHT,
            min: RAPID_LINES.ZONE_FROM_RIGHT - gameState.zoneWidth,
        };

        // KEY PRESS HANDLER
        const handleKeyPress = (e: KeyboardEvent) => {
            if (gameLogicRef.current.isEnded || e.key.toUpperCase() !== KEYS.Primary) return;

            let furthestLineId: string | null = null;
            let furthestLinePos = -1;

            setGameState(currentGameState => {
                if (!currentGameState) return null;

                currentGameState.lines.forEach((line) => {
                    if (line.state === null) {
                        const pos = linePositionsRef.current.get(line.id) ?? -1;
                        if (pos >= zoneRange.min && pos <= zoneRange.max) {
                            if (pos > furthestLinePos) {
                                furthestLinePos = pos;
                                furthestLineId = line.id;
                            }
                        }
                    }
                });

                if (furthestLineId) {
                    return {
                        ...currentGameState,
                        lines: currentGameState.lines.map(l =>
                            l.id === furthestLineId ? { ...l, state: 'success' } : l
                        )
                    };
                } else {
                    gameLogicRef.current.isEnded = true;
                    handleGameEnd(false);
                    return {
                        ...currentGameState,
                        lines: currentGameState.lines.map(l => ({ ...l, state: 'fail' }))
                    };
                }
            });
        };
        
        gameLogicRef.current.keyListener = handleKeyPress;
        window.addEventListener('keydown', gameLogicRef.current.keyListener);

        // CHECK FOR COMPLETION / MISSED LINES
        const checkInterval = setInterval(() => {
            if (gameLogicRef.current.isEnded) {
                clearInterval(checkInterval);
                return;
            }

            setGameState(currentGameState => {
                if (!currentGameState) return null;
                
                let hasMissed = false;
                let completedLines = 0;

                const newLines = currentGameState.lines.map(line => {
                    if (line.state !== null) {
                        completedLines++;
                        return line;
                    }

                    const position = linePositionsRef.current.get(line.id) ?? 0;
                    if (position > zoneRange.max) {
                        hasMissed = true;
                        return { ...line, state: "fail" };
                    }
                    return line;
                });
                
                if (hasMissed) {
                    gameLogicRef.current.isEnded = true;
                    handleGameEnd(false);
                    return { ...currentGameState, lines: newLines };
                }

                if (completedLines === newLines.length) {
                    gameLogicRef.current.isEnded = true;
                    const allSuccess = newLines.every(l => l.state === 'success');
                    handleGameEnd(allSuccess);
                }

                return { ...currentGameState, lines: newLines };
            });

        }, 100);

        return () => {
            window.removeEventListener('keydown', gameLogicRef.current.keyListener);
            clearInterval(checkInterval);
        };

    }, [gameStatus, gameState, handleGameEnd]);

    const startGame = useCallback(() => {
        setGameStatus('playing');
        linePositionsRef.current.clear();

        // Zone size affects zone width (invert: higher slider = smaller zone)
        const generateZone = (zoneSizeValue: number): number => {
            const { MIN, MAX } = RAPID_LINES.ZONE;
            // Invert zone size: higher slider = smaller zone
            return MIN + (MAX - MIN) * ((100 - zoneSizeValue) / 100);
        };

        // Speed affects duration (make speed more sensitive)
        const generateDuration = (speedValue: number): number => {
            const { MIN, MAX } = RAPID_LINES.DURATION;
            // Lower speedValue means faster, so invert and make more sensitive
            return Math.max(MIN, MIN + (MAX - MIN) * ((100 - speedValue * 1.5) / 100)) + Math.random() * 300;
        };

        const generateLines = (numLines: number, baseDuration: number): TLine[] => {
            return Array.from({ length: numLines }, (_, i) => ({
                id: `line-${Date.now()}-${i}`,
                state: null,
                duration: baseDuration,
                delay: (baseDuration * 0.4) * i + (Math.random() * 200),
            }));
        };

        const duration = generateDuration(speed);
        setGameState({
            lines: generateLines(numberOfLines, duration),
            zoneWidth: generateZone(zoneSize),
        });
    }, [speed, zoneSize, numberOfLines]);

    const startConfiguredGame = () => {
        setShowConfig(false);
        startGame();
    };

    return (
        <div className="w-full flex flex-col items-center mt-24 rapidlines-container bg-black">
            <GameStyles />
            <AnimatePresence mode="wait">
                {showConfig ? (
                    <motion.div key="config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="config-screen bg-primary p-8 rounded-lg max-w-md w-full">
                        <h1 className="text-3xl font-bold text-center mb-6">Repair Kit</h1>
                        <p className="text-muted mb-8 text-center">Press the '{KEYS.Primary}' key when a line is in the white zone.</p>
                        {/* Speed slider */}
                        <div className="mb-4">
                            <label className="block text-muted mb-2">Speed: {speed}</label>
                            <input type="range" min="1" max="100" value={speed} onChange={(e) => setSpeed(parseInt(e.target.value))} className="w-full" />
                        </div>
                        {/* Zone Size slider */}
                        <div className="mb-4">
                            <label className="block text-muted mb-2">
                                Zone Size (higher = smaller zone): {zoneSize}
                            </label>
                            <input type="range" min="1" max="100" value={zoneSize} onChange={(e) => setZoneSize(parseInt(e.target.value))} className="w-full" />
                        </div>
                        {/* Number of Lines slider */}
                        {/* <div className="mb-4">
                            <label className="block text-muted mb-2">Number of Lines: {numberOfLines}</label>
                            <input type="range" min="1" max="10" value={numberOfLines} onChange={(e) => setNumberOfLines(parseInt(e.target.value))} className="w-full" />
                        </div> */}
                        <button onClick={startConfiguredGame} className="w-full btn-accent text-white p-3 rounded font-bold">Start Game</button>
                    </motion.div>
                ) : (
                    <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="game-screen w-full h-full flex flex-col items-center mt-44">
                         <div className="absolute top-1/4 text-center">
                            {gameStatus === "success" && <p className="text-success text-2xl font-bold">Success!</p>}
                            {gameStatus === "fail" && <p className="text-error text-2xl font-bold">Game Over!</p>}
                        </div>
                        {gameState && (
                            <div className="w-[20vw] h-[0.5vw] bg-primary primary-shadow flex items-center relative">
                                <div className="h-[2.5vw] aspect-square absolute grid place-items-center center-y primary-shadow bg-primary -translate-x-[130%]">
                                    <p className="text-shadow absolute font-bold text-[2vw]">{KEYS.Primary}</p>
                                </div>
                                <div style={{ width: `${gameState.zoneWidth}%`, left: `${RAPID_LINES.ZONE_FROM_RIGHT - gameState.zoneWidth}%` }} className="bg-tertiary primary-shadow h-[1vw] z-0 absolute" />
                                {gameState.lines.map((line) => (
                                    <Line key={line.id} {...line} onPositionUpdate={handlePositionUpdate} />
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Restart Game button below the game screen */}
            {!showConfig && (
                <div className="flex flex-col items-center mt-8">
                    <button
                        className="w-32 bg-red-500 hover:opacity-80 transition-all text-white rounded py-2 font-bold"
                        onClick={() => {
                            setGameState(null);
                            setGameStatus(null);
                            setShowConfig(true);
                        }}
                    >
                        Restart
                    </button>
                </div>
            )}
        </div>
    );
}