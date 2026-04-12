'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HackWrapper from './lib/HackWrapper';
import Cell from './MineSweeper/Cell';
import { TGridHackGameParam, TLevelState } from './typings/gameState';
import { TMineSweeperCellUser, TMineSweeperGameState } from './typings/mineSweeper';
import { delay, getRandomIntFromIntOrArray } from './misc';

// Component-specific styles
const GameStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');

        .minesweeper-container {
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

        .minesweeper-container * {
            color: rgb(var(--foreground));
            font-family: "Roboto", sans-serif;
        }

        .minesweeper-container .bg-primary {
            background-color: rgb(var(--primary));
        }
        .minesweeper-container .bg-secondary {
            background-color: rgb(var(--secondary));
        }
        .minesweeper-container .text-muted {
            color: rgba(var(--foreground), 0.7);
        }
        .minesweeper-container .btn-accent {
            background-color: rgb(var(--accent));
            transition: background-color 0.2s;
        }
        .minesweeper-container .btn-accent:hover {
            background-color: rgba(var(--accent), 0.8);
        }
    `}</style>
);

export default function MineSweeper() {
    // Game state
    const [mineSweeperState, setMineSweeperState] = useState<TMineSweeperGameState | null>(null);
    const [preview, setPreview] = useState(false);
    const [iterationState, setIterationState] = useState<TLevelState>(null);
    const [userDuration, setUserDuration] = useState(0);
    const [userMistakes, setUserMistakes] = useState(0);
    const [userCorrect, setUserCorrect] = useState(0);
    const [gameNumberMines, setGameNumberMines] = useState(0);
    const [iterations, setIterations] = useState<number | null>(null);

    // Configuration screen state
    const [showConfig, setShowConfig] = useState(true);
    const [difficulty, setDifficulty] = useState('normal');
    const [gridSize, setGridSize] = useState(5);
    const [mineCount, setMineCount] = useState(5);
    const [gameDuration, setGameDuration] = useState(10000);
    const [iterationCount, setIterationCount] = useState(3);
    const [mistakeLimit, setMistakeLimit] = useState(3);

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

    useEffect(() => {
        if (mineSweeperState && userDuration > 0 && !preview && !iterationState) {
            const timer = setTimeout(() => {
                if (userDuration < mineSweeperState.duration) {
                    setUserDuration(prev => prev + 100);
                } else {
                    if (finishIterationRef.current) {
                        finishIterationRef.current(false);
                    }
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [userDuration, mineSweeperState, preview, iterationState]);

    useEffect(() => {
        if (!finishIterationRef.current || (userCorrect === 0 && userMistakes === 0)) {
            return;
        }
    
        if (userCorrect === gameNumberMines) {
            finishIterationRef.current(true);
        } else if (userMistakes >= mistakeLimit) {
            finishIterationRef.current(false);
        }
    }, [userCorrect, userMistakes, gameNumberMines, mistakeLimit]);

    const handleGameEnd = (success: boolean) => {
        console.log(`Game ended with status: ${success ? 'Success' : 'Failure'}`);
        clearCleanUpFunctions();
        setMineSweeperState(null);
        setIterationState(null);
        setShowConfig(true);
    };

    async function startGame(iterationsRemaining: number, config: TGridHackGameParam) {
        setUserMistakes(0);
        setUserCorrect(0);
        setUserDuration(0);
        setIterationState(null);

        const duration = getRandomIntFromIntOrArray(config.duration);
        const currentGridSize = getRandomIntFromIntOrArray(config.grid);
        const numberOfMines = getRandomIntFromIntOrArray(config.target);
        setGameNumberMines(numberOfMines);
        
        const grid = generateGrid(currentGridSize, numberOfMines);

        setMineSweeperState({
            grid,
            duration: duration,
            currentIteration: (iterations || 0) - iterationsRemaining + 1
        });

        await delay(500);
        setPreview(true);

        const previewTimeout = setTimeout(() => {
            setPreview(false);
            setUserDuration(1);
        }, config.previewDuration || 5000);

        cleanUpFunctionsRef.current.push(() => clearTimeout(previewTimeout));
        await delay(config.previewDuration || 5000);

        const success = await playIteration(duration);
        
        setIterationState(success ? 'success' : 'fail');

        const isLastIteration = iterationsRemaining <= 1;
        const timeout = setTimeout(() => {
            if (success && !isLastIteration) {
                startGame(iterationsRemaining - 1, config);
            } else {
                handleGameEnd(success);
            }
        }, 1000);

        cleanUpFunctionsRef.current.push(() => clearTimeout(timeout));
    }

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

    function generateGrid(size: number, numMines: number): TMineSweeperCellUser[][] {
        const grid: TMineSweeperCellUser[][] = Array.from({ length: size }, () =>
            Array.from({ length: size }, () => ({
                mine: false,
                state: null,
                clicked: false
            }))
        );

        let minesPlaced = 0;
        while (minesPlaced < numMines) {
            const row = Math.floor(Math.random() * size);
            const col = Math.floor(Math.random() * size);
            if (!grid[row][col].mine) {
                grid[row][col].mine = true;
                minesPlaced++;
            }
        }
        return grid;
    }

    function clickCell(row: number, col: number) {
        if (preview || iterationState || !mineSweeperState || mineSweeperState.grid[row][col].clicked) return;

        const newGrid = mineSweeperState.grid.map(r => r.map(c => ({...c})));
        const cell = newGrid[row][col];

        cell.clicked = true;
        cell.state = cell.mine ? 'success' : 'fail';

        if (cell.mine) {
            setUserCorrect(prev => prev + 1);
        } else {
            setUserMistakes(prev => prev + 1);
        }

        setMineSweeperState(prevState => ({
            ...prevState!,
            grid: newGrid
        }));
    }

    const startConfiguredGame = () => {
        clearCleanUpFunctions();
        setIterations(iterationCount);
        setShowConfig(false);

        const config: TGridHackGameParam = {
            duration: gameDuration,
            grid: gridSize,
            target: mineCount,
            previewDuration: 5000
        };

        startGame(iterationCount, config);
    };

    return (
        <div className="w-full h-full flex items-center justify-center minesweeper-container">
            <GameStyles />
            <AnimatePresence mode="wait">
                {showConfig ? (
                    <motion.div 
                        key="config"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="config-screen bg-primary p-8 rounded-lg max-w-md w-full"
                    >
                        <h1 className="text-3xl font-bold text-center mb-6">Mine Sweeper</h1>
                        <p className="text-muted mb-8 text-center">Remember the mines and clear them all.</p>
                        
                        <div className="mb-4">
                            <label className="block text-muted mb-2">Difficulty</label>
                            <select 
                                className="w-full p-2 bg-secondary text-white rounded"
                                value={difficulty}
                                onChange={(e) => {
                                    const newDifficulty = e.target.value;
                                    setDifficulty(newDifficulty);
                                    if (newDifficulty === 'easy') {
                                        setGridSize(4); setMineCount(3); setGameDuration(15000); setIterationCount(2); setMistakeLimit(5);
                                    } else if (newDifficulty === 'normal') {
                                        setGridSize(5); setMineCount(5); setGameDuration(10000); setIterationCount(3); setMistakeLimit(3);
                                    } else {
                                        setGridSize(6); setMineCount(8); setGameDuration(8000); setIterationCount(4); setMistakeLimit(2);
                                    }
                                }}
                            >
                                <option value="easy">Easy</option>
                                <option value="normal">Normal</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-muted mb-2">Grid Size: {gridSize}x{gridSize}</label>
                            <input type="range" min="3" max="8" value={gridSize} onChange={(e) => setGridSize(parseInt(e.target.value))} className="w-full" />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-muted mb-2">Number of Mines: {mineCount}</label>
                            <input type="range" min="1" max={Math.floor(gridSize * gridSize / 2)} value={mineCount} onChange={(e) => setMineCount(parseInt(e.target.value))} className="w-full" />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-muted mb-2">Time Limit: {gameDuration / 1000}s</label>
                            <input type="range" min="5000" max="30000" step="1000" value={gameDuration} onChange={(e) => setGameDuration(parseInt(e.target.value))} className="w-full" />
                        </div>

                        <div className="mb-4">
                            <label className="block text-muted mb-2">Mistake Limit: {mistakeLimit}</label>
                            <input 
                                type="range" 
                                min="1" 
                                max="10"
                                value={mistakeLimit}
                                onChange={(e) => setMistakeLimit(parseInt(e.target.value))}
                                className="w-full"
                            />
                        </div>
                        
                        <div className="mb-8">
                            <label className="block text-muted mb-2">Rounds: {iterationCount}</label>
                            <input type="range" min="1" max="5" value={iterationCount} onChange={(e) => setIterationCount(parseInt(e.target.value))} className="w-full" />
                        </div>
                        
                        <button onClick={startConfiguredGame} className="w-full btn-accent text-white p-3 rounded font-bold">
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
                        {mineSweeperState && (
                            <HackWrapper
                                state={iterationState}
                                title={['Mine', 'Sweeper']}
                                subtitle="Remember the mines and clear them all."
                                iterations={iterations || 0}
                                iteration={mineSweeperState.currentIteration}
                                progress={(userDuration / mineSweeperState.duration) * 100}
                            >
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: `repeat(${mineSweeperState.grid.length}, 1fr)`,
                                    }}
                                    className="w-[60vh] h-[60vh] aspect-square gap-[2vh] grid"
                                >
                                    {mineSweeperState.grid.map((row, rowIndex) => (
                                        row.map((cell, colIndex) => (
                                            <motion.div
                                                key={`${rowIndex}-${colIndex}`}
                                                className="w-full h-full grid place-items-center"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: (colIndex + rowIndex) * 0.025 }}
                                            >
                                                <Cell
                                                    state={iterationState}
                                                    mine={cell.mine}
                                                    bombState={cell.state}
                                                    preview={preview}
                                                    onClick={() => clickCell(rowIndex, colIndex)}
                                                />
                                            </motion.div>
                                        ))
                                    ))}
                                </div>
                            </HackWrapper>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
