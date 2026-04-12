'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HackWrapper from '../MineSweeper/lib/HackWrapper';
import { TGridHackGameParam, TLevelState } from '../MineSweeper/typings/gameState';
import { TPrintLockGameState } from '../MineSweeper/typings/printLock';
import { delay, getRandomIntFromIntOrArray, polarToCartesian, randomBetween } from '../MineSweeper/misc';

const VH_WIDTH = 67.5;

function getVhPx() {
    if (typeof window !== 'undefined') {
        return (VH_WIDTH * window.innerHeight) / 100;
    }
    return 600; // fallback
}

const NUMBER_OF_RIDGES = 100;
const RIDGE_SIZE = 5;
const RIDGE_SPACING = 5;

// Component-specific styles
const GameStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');

        .print-lock-container {
            --background: 0 0 0;
            --foreground: 250 247 255;
            --primary: 37 37 37;
            --primary-foreground: 250 247 255;
            --secondary: 60 60 60;
            --secondary-foreground: 250 247 255;
            --tertiary: 250 247 255;
            --tertiary-foreground: 37 37 37;
            --accent: 134 133 239;
            --accent-foreground: 250 247 255;
            --success: 102 231 138;
            --success-foreground: 250 247 255;
            --error: 229 40 62;
            --error-foreground: 250 247 255;
            --warning: 255 222 112;
            --warning-foreground: 250 247 255;
            --border: 60 60 60;
            --radius: 0px;
            font-family: "Roboto", sans-serif;
        }

        .print-lock-container * {
            color: rgb(var(--foreground));
        }

        .print-lock-container .default-colour-transition {
            transition: color 200ms, background-color 200ms, border-color 200ms, fill 200ms, stroke 200ms;
        }

        .print-lock-container .default-all-transition {
            transition: all 200ms;
        }

        .print-lock-container .glow-accent {
            filter: drop-shadow(0 0 0.3vw rgb(var(--accent)));
        }

        .print-lock-container .glow-error {
            filter: drop-shadow(0 0 0.3vw rgb(var(--error)));
        }

        .print-lock-container .glow-success {
            filter: drop-shadow(0 0 0.3vw rgb(var(--success)));
        }
        
        .print-lock-container .bg-accent {
             background-color: rgb(var(--accent));
        }
        
        .print-lock-container .bg-foreground {
             background-color: rgb(var(--foreground));
        }
        
        .print-lock-container .border-accent {
            border-color: rgb(var(--accent));
        }

        .print-lock-container .border-foreground {
            border-color: rgb(var(--foreground));
        }
        
        .print-lock-container .stroke-tertiary {
             stroke: rgb(var(--tertiary));
        }
        
        .print-lock-container .bg-secondary\/90 {
            background-color: rgba(var(--secondary), 0.9);
        }

        .print-lock-container .border-success {
            border-color: rgb(var(--success));
        }

        .print-lock-container .border-error {
            border-color: rgb(var(--error));
        }
    `}</style>
);


export default function PrintLock() {
    // Game state
    const [printLockState, setPrintLockState] = useState<TPrintLockGameState | null>(null);
    const [iterationState, setIterationState] = useState<TLevelState>(null);
    const [userDuration, setUserDuration] = useState(0);
    const [iterations, setIterations] = useState<number | null>(null);

    // Config screen state
    const [showConfig, setShowConfig] = useState(true);
    const [difficulty, setDifficulty] = useState('normal');
    const [gridSize, setGridSize] = useState(3);
    const [targetLength, setTargetLength] = useState(3);
    const [gameDuration, setGameDuration] = useState(10000);
    const [iterationCount, setIterationCount] = useState(3);

    // Reference for SVG container
    const containerRef = useRef<HTMLDivElement>(null);

    // Game logic refs
    const finishIterationRef = useRef<((result: boolean) => void) | null>(null);
    const cleanUpFunctionsRef = useRef<Function[]>([]);

    const clearCleanUpFunctions = () => {
        cleanUpFunctionsRef.current.forEach(fn => fn());
        cleanUpFunctionsRef.current = [];
    };

    useEffect(() => {
        return () => {
            clearCleanUpFunctions();
        };
    }, []);

    // Timer effect
    useEffect(() => {
        if (printLockState && userDuration > 0 && !iterationState) {
            const timer = setTimeout(() => {
                if (userDuration < printLockState.duration) {
                    setUserDuration(prev => prev + 100);
                } else {
                    // Time's up for the current iteration
                    if (finishIterationRef.current) {
                        finishIterationRef.current(false);
                    }
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [userDuration, printLockState, iterationState]);

    /**
     * Handles the end of the entire game (after all iterations are complete).
     * Resets all state back to the configuration screen.
     */
    const handleGameEnd = (success: boolean) => {
        clearCleanUpFunctions();
        setPrintLockState(null);
        setIterationState(null);
        setShowConfig(true);
    };

    /**
     * Starts a single game iteration.
     */
    async function startGame(iterationsRemaining: number, config: TGridHackGameParam) {
        setUserDuration(0);
        setIterationState(null);

        // Generate game parameters for this iteration
        const duration = getRandomIntFromIntOrArray(config.duration);
        const length = getRandomIntFromIntOrArray(config.target);
        const sectionsLength = getRandomIntFromIntOrArray(config.grid);
        const lockedIndex = getRandomIntFromIntOrArray([0, sectionsLength - 1]);
        const prints = generatePrints(length);

        setPrintLockState({
            prints,
            sections: Array.from({ length: sectionsLength }, (_, i) => ({
                print: getRandomIntFromIntOrArray([0, length - 1]),
                locked: i === lockedIndex,
            })),
            duration: duration,
            currentIteration: (iterations || 0) - iterationsRemaining + 1,
        });

        await delay(500);

        setUserDuration(1); // Start the timer

        // Play the iteration and wait for result
        const success = await playIteration(duration);

        setIterationState(success ? 'success' : 'fail');

        const isLastIteration = iterationsRemaining <= 1;
        const timeout = setTimeout(() => {
            if (success && !isLastIteration) {
                // Continue to next iteration
                startGame(iterationsRemaining - 1, config);
            } else {
                // Game over
                handleGameEnd(success);
            }
        }, 1000);

        cleanUpFunctionsRef.current.push(() => clearTimeout(timeout));
    }

    /**
     * Manages the core promise for a single playable iteration.
     * Resolves to true (success) or false (failure).
     */
    async function playIteration(duration: number): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const finish = (result: boolean) => {
                finishIterationRef.current = null;
                clearTimeout(durationCheck);
                cleanUpFunctionsRef.current = cleanUpFunctionsRef.current.filter(fn => fn !== resolver);
                resolve(result);
            };

            finishIterationRef.current = finish;

            const durationCheck = setTimeout(() => {
                finish(false);
            }, duration + 500);

            const resolver = () => resolve(false);
            cleanUpFunctionsRef.current.push(resolver);
        });
    }

    /**
     * Creates an SVG arc path.
     */
    function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
        let start = polarToCartesian(x, y, radius, endAngle);
        let end = polarToCartesian(x, y, radius, startAngle);

        let largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

        let d = [
            'M',
            start.x,
            start.y,
            'A',
            radius,
            radius,
            0,
            largeArcFlag,
            0,
            end.x,
            end.y,
        ].join(' ');

        return d;
    }

    /**
     * Generates random paths for a fingerprint.
     */
    function generatePaths() {
        const width = getVhPx() * 0.85;
        const height = width;

        const centerX = width / 2;
        const centerY = height / 2;

        const minMax = Math.min(width, height);
        const exclusionRadius = width * 0.15;
        const maxRadius = minMax / 2;

        const paths = [];

        const ridges = getRandomIntFromIntOrArray([NUMBER_OF_RIDGES / 2, NUMBER_OF_RIDGES]);
        const availableSpace = maxRadius - exclusionRadius;
        const maxRidges = Math.floor(availableSpace / RIDGE_SPACING);
        const actualRidges = Math.min(ridges, maxRidges);

        for (let i = 0; i < actualRidges; i++) {
            let radius = exclusionRadius + (i + 1) * RIDGE_SPACING;
            radius += randomBetween(-RIDGE_SPACING / 2, RIDGE_SPACING / 2);
            radius = Math.max(exclusionRadius, Math.min(radius, maxRadius));

            let startAngle = randomBetween(0, 360);
            let endAngle = startAngle + randomBetween(30, 90);

            paths.push(
                describeArc(centerX, centerY, radius, startAngle, endAngle)
            );
        }

        return paths;
    }

    /**
     * Generates a set of fingerprints.
     */
    function generatePrints(length: number) {
        const prints = [];
        for (let i = 0; i < length; i++) {
            const paths = generatePaths();
            prints.push(paths);
        }
        return prints;
    }

    /**
     * Returns the appropriate CSS class based on the game state.
     */
    function getStateClass(iterationState: TLevelState) {
        switch (iterationState) {
            case 'success':
                return 'bg-success/50 glow-success border-success';
            case 'fail':
                return 'bg-error/50 glow-error border-error';
            default:
                return 'bg-accent/50 glow-accent border-accent';
        }
    }

    /**
     * Handles clicking on a section button to change the print.
     */
    function onButtonClick(index: number, direction: number) {
        if (iterationState || !printLockState) return;

        const { sections, prints } = printLockState;
        const section = sections[index];

        if (section.locked) {
            return;
        }

        let newPrintIndex = section.print + direction;
        if (newPrintIndex < 0) {
            newPrintIndex = prints.length - 1;
        } else if (newPrintIndex >= prints.length) {
            newPrintIndex = 0;
        }

        const newSections = [...sections];
        newSections[index] = { ...section, print: newPrintIndex };

        setPrintLockState(prev => {
            if (!prev) return prev;
            return { ...prev, sections: newSections };
        });

        // Check if all sections match the locked section
        setTimeout(() => {
            const targetPrint = newSections.find(s => s.locked);
            const allCorrect = newSections.every(s => s.print === targetPrint?.print);
            if (allCorrect && finishIterationRef.current) {
                finishIterationRef.current(true);
            }
        }, 250);
    }

    /**
     * Starts the game with configured settings.
     */
    const startConfiguredGame = () => {
        clearCleanUpFunctions();
        setIterations(iterationCount);
        setShowConfig(false);

        const config: TGridHackGameParam = {
            duration: gameDuration,
            grid: gridSize,
            target: targetLength,
            previewDuration: 0
        };

        startGame(iterationCount, config);
    };

    const CONST_SIZE = getVhPx() * 0.85;

    return (
        <div className="w-full h-full flex items-center justify-center print-lock-container">
            <GameStyles />
            <AnimatePresence mode="wait">
                {showConfig ? (
                    <motion.div
                        key="config"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="config-screen bg-gray-900 p-8 rounded-lg max-w-md w-full"
                    >
                        <h1 className="text-3xl font-bold text-center mb-6 text-white">Print Lock</h1>
                        <p className="text-gray-300 mb-8 text-center">Sift through the prints and find the matches.</p>

                        <div className="mb-4">
                            <label className="block text-gray-300 mb-2">Difficulty</label>
                            <select
                                className="w-full p-2 bg-gray-800 text-white rounded"
                                value={difficulty}
                                onChange={(e) => {
                                    const newDifficulty = e.target.value;
                                    setDifficulty(newDifficulty);
                                    if (newDifficulty === 'easy') {
                                        setGridSize(2); setTargetLength(2); setGameDuration(15000); setIterationCount(2);
                                    } else if (newDifficulty === 'normal') {
                                        setGridSize(3); setTargetLength(3); setGameDuration(10000); setIterationCount(3);
                                    } else {
                                        setGridSize(4); setTargetLength(4); setGameDuration(8000); setIterationCount(4);
                                    }
                                }}
                            >
                                <option value="easy">Easy</option>
                                <option value="normal">Normal</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-300 mb-2">Number of Sections: {gridSize}</label>
                            <input type="range" min="2" max="6" value={gridSize} onChange={(e) => setGridSize(parseInt(e.target.value))} className="w-full" />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-300 mb-2">Prints per Section: {targetLength}</label>
                            <input type="range" min="2" max="8" value={targetLength} onChange={(e) => setTargetLength(parseInt(e.target.value))} className="w-full" />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-300 mb-2">Time Limit: {gameDuration / 1000}s</label>
                            <input type="range" min="5000" max="30000" step="1000" value={gameDuration} onChange={(e) => setGameDuration(parseInt(e.target.value))} className="w-full" />
                        </div>

                        <div className="mb-8">
                            <label className="block text-gray-300 mb-2">Iterations: {iterationCount}</label>
                            <input type="range" min="1" max="5" value={iterationCount} onChange={(e) => setIterationCount(parseInt(e.target.value))} className="w-full" />
                        </div>

                        <button onClick={startConfiguredGame} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded font-bold transition">
                            Start Game
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="game"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="game-screen w-full h-full flex items-center justify-center mt-96"
                    >
                        {printLockState && (
                            <HackWrapper
                                state={iterationState}
                                title={['Print', 'Lock']}
                                subtitle="Sift through the prints and find the matches."
                                iterations={iterations || 0}
                                iteration={printLockState.currentIteration}
                                progress={(userDuration / printLockState.duration) * 100}
                            >
                                <div
                                    style={{
                                        width: `calc(${CONST_SIZE}px + 7.5vh)`,
                                        height: `${CONST_SIZE}px`,
                                    }}
                                    className="flex flex-col items-center justify-center"
                                >
                                    <div 
                                        ref={containerRef}
                                        className="w-[85%] aspect-square grid place-items-center relative"
                                    >
                                        <div className={`w-[20%] aspect-square absolute rounded-full border ${getStateClass(iterationState)}`} />
                                        
                                        {printLockState.sections.map((section, i) => (
                                            <motion.svg
                                                key={i + '-' + section.print}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="w-full aspect-square absolute overflow-visible"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox={`0 0 ${CONST_SIZE} ${CONST_SIZE}`}
                                            >
                                                <mask id={`mask-${i}_${section.print}`}>
                                                    <rect
                                                        x={0}
                                                        y={(CONST_SIZE / printLockState.sections.length) * i}
                                                        width={CONST_SIZE}
                                                        height={CONST_SIZE / printLockState.sections.length}
                                                        fill="white"
                                                    />
                                                </mask>
                                                
                                                {printLockState.prints[section.print].map((path, pathIndex) => (
                                                    <path
                                                        key={pathIndex}
                                                        d={path}
                                                        fill="none"
                                                        mask={`url(#mask-${i}_${section.print})`}
                                                        className={`stroke-tertiary overflow-visible default-colour-transition ${getStateClass(iterationState)}`}
                                                        strokeWidth={RIDGE_SIZE}
                                                    />
                                                ))}
                                            </motion.svg>
                                        ))}
                                        
                                        <div className="w-[101%] h-[101%] bg-secondary/90 absolute -z-10" />
                                        
                                        {/* LAYOUT FIX: Moved the interactive overlay inside the relative container */}
                                        <div className="w-full h-full absolute top-0 left-0 flex flex-col">
                                            {printLockState.sections.map((section, i) => {
                                                const locked = section.locked;
                                                const lockedClass = locked && !iterationState
                                                    ? ''
                                                    : 'hover:scale-x-105 active:scale-x-100';
                                                const buttonClass = locked
                                                    ? 'bg-foreground '
                                                    : 'bg-accent hover:scale-105 active:scale-100 glow-accent';
                                                
                                                return (
                                                    <div key={i} className="w-full h-full flex items-center justify-center z-10">
                                                        <button
                                                            onClick={() => onButtonClick(i, -1)}
                                                            disabled={locked}
                                                            className={`w-[4vh] h-[80%] default-all-transition ${lockedClass} ${buttonClass}`}
                                                        />
                                                        <div
                                                            className={`w-full h-full border-x-[0.2vh] ${
                                                                i === 0
                                                                    ? 'border-b-[0.1vh] border-t-[0.2vh]'
                                                                    : i === printLockState.sections.length - 1
                                                                    ? 'border-t-[0.1vh] border-b-[0.2vh]'
                                                                    : ' border-y-[0.1vh]'
                                                            } ${locked ? 'border-foreground ' : 'border-accent'}`}
                                                        />
                                                        <button
                                                            onClick={() => onButtonClick(i, 1)}
                                                            disabled={locked}
                                                            className={`w-[4vh] h-[80%] default-all-transition ${lockedClass} ${buttonClass}`}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </HackWrapper>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
