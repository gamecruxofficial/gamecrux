"use client";

import { useState, useEffect, useCallback } from 'react';
import { Slider } from "@/components/ui/slider"; // Assumes you have this component from Shadcn UI
import { Button } from "@/components/ui/button";   // Assumes you have this component from Shadcn UI
import { CircleUserRound } from 'lucide-react';  // Icon for the config screen

// Helper to inject CSS once
const injectCss = () => {
    if (document.getElementById('sos-game-style')) return;

    const style = document.createElement('style');
    style.id = 'sos-game-style';
    style.textContent = `
      * {
        font-family: "Inter", sans-serif;
        padding: 0;
        margin: 0;
      }
      body {
        display: flex;
        background-color: #000;
        height: 100vh;
        width: 100vw;
        justify-content: center;
        align-items: center;
        overflow: hidden;
      }
      .game-root-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100vh;
        color: white;
      }
      /* --- Styles for Config Screen to match VAR-Sim --- */
      .config-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        color: white;
        padding: 1rem;
      }
      .config-container h1 {
        font-size: 1.875rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
      }
      .config-container .subtitle {
        font-size: 1.125rem;
        color: #9ca3af;
        margin-bottom: 2rem;
      }
      .slider-group {
        width: 100%;
        max-width: 40rem;
        padding: 1rem;
      }
      .slider-group > div {
        margin-bottom: 1rem;
      }
      .slider-group label {
        display: block;
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
      }
      .config-container .helper-text {
        font-size: 0.875rem;
        margin-top: 0.5rem;
      }
      /* --- End Config Screen Styles --- */
      .hack-box-container {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        border-radius: 10px;
        width: calc(var(--grid-columns) * 92px + 20px);
        height: calc(var(--grid-rows) * 92px + 60px);
      }
      .lock-container {
        display: grid;
        grid-template-columns: repeat(var(--grid-columns), 1fr);
        gap: 2px;
        z-index: 10;
      }
      .cube {
        width: 90px;
        height: 90px;
        border: 1.5px solid #fff;
        background-color: #000;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
      }
      .cube.empty {
        background-color: #111;
        border-color: #333;
        cursor: default;
      }
      .cube img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        pointer-events: none;
      }

      .timer-container {
        background: rgba(255, 255, 255, 0.14);
        display: flex;
        width: 98%;
        height: 10px;
        top: 98%;
        margin-top: auto;
        overflow: hidden;
      }
      .timer-progress-bar {
        bottom: 100px;
        background-color: #d71f3e;
        width: 100%;
        height: 100%;
      }
      .game-overlay {
        position: absolute;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        z-index: 100;
      }
      .game-overlay h2 {
        font-size: 2.5rem;
        font-weight: bold;
      }
      .game-overlay .win { color: #2ecc71; }
      .game-overlay .lose { color: #e74c3c; }
    `;
    document.head.appendChild(style);
};

interface CubeState {
    id: number;
    color: 'cuber' | 'cubeg' | 'cubeb';
    isEmpty: boolean;
}

// --- CONFIGURATION SCREEN (Now visually identical to VAR-sim) ---
const ConfigScreen = ({ onStart }: { onStart: (settings: any) => void }) => {
    const [settings, setSettings] = useState({
        gridCols: 11,
        gridRows: 8,
        totalSeconds: 25,
        maxMistakes: 5,
    });

    const handleSettingChange = (key: keyof typeof settings, value: number) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="config-container">
            <CircleUserRound className="w-16 h-16 mb-4" />
            <h1>Roof Running</h1>
            <p className="subtitle">Proof of Training Required</p>

            <div className="slider-group">
                <div>
                    <label>Columns: {settings.gridCols}</label>
                    <Slider
                        value={[settings.gridCols]}
                        onValueChange={([val]) => handleSettingChange('gridCols', val)}
                        min={5}
                        max={15}
                        step={1}
                        className="bg-gray-800"
                    />
                </div>
                <div>
                    <label>Rows: {settings.gridRows}</label>
                    <Slider
                        value={[settings.gridRows]}
                        onValueChange={([val]) => handleSettingChange('gridRows', val)}
                        min={4}
                        max={12}
                        step={1}
                        className="bg-gray-800"
                    />
                </div>
                <div>
                    <label>Time: {settings.totalSeconds}s</label>
                    <Slider
                        value={[settings.totalSeconds]}
                        onValueChange={([val]) => handleSettingChange('totalSeconds', val)}
                        min={10}
                        max={60}
                        step={1}
                        className="bg-gray-800"
                    />
                </div>
                <div>
                    <label>Max Mistakes: {settings.maxMistakes}</label>
                    <Slider
                        value={[settings.maxMistakes]}
                        onValueChange={([val]) => handleSettingChange('maxMistakes', val)}
                        min={1}
                        max={10}
                        step={1}
                        className="bg-gray-800"
                    />
                </div>
            </div>

            <Button
                size="lg"
                onClick={() => onStart(settings)}
                className="bg-[#2c465e] hover:bg-[#425e79] mt-6"
            >
                PLAY NOW
            </Button>
            <p className="helper-text">Press PLAY NOW to start</p>
        </div>
    );
};

// --- GAME SCREEN COMPONENT (No changes here) ---
const GameScreen = ({ settings, onGameEnd }: { settings: any, onGameEnd: (outcome: 'win' | 'lose') => void }) => {
    const [cubes, setCubes] = useState<CubeState[]>([]);
    const [mistakes, setMistakes] = useState(0);

    const { gridCols, gridRows, totalSeconds, maxMistakes } = settings;

    // Generate initial cubes
    useEffect(() => {
        const colors: ('cuber' | 'cubeg' | 'cubeb')[] = ["cuber", "cubeg", "cubeb"];
        const newCubes = Array.from({ length: gridRows * gridCols }, (_, i) => ({
            id: i,
            color: colors[Math.floor(Math.random() * colors.length)],
            isEmpty: false,
        }));
        setCubes(newCubes);
    }, [gridCols, gridRows]);

    // Timer logic
    useEffect(() => {
        const timerProgressBar = document.querySelector(".timer-progress-bar") as HTMLElement;
        if (timerProgressBar) {
            timerProgressBar.style.transition = `width ${totalSeconds}s linear`;
            setTimeout(() => { timerProgressBar.style.width = "0%"; }, 100);
        }

        const gameTimer = setTimeout(() => {
            onGameEnd('lose');
        }, totalSeconds * 1000);

        return () => clearTimeout(gameTimer);
    }, [totalSeconds, onGameEnd]);

    const handleCubeClick = useCallback((clickedIndex: number) => {
        const clickedCube = cubes[clickedIndex];
        if (clickedCube.isEmpty) return;

        const connected = new Set<number>();
        const queue = [clickedIndex];
        const visited = new Set([clickedIndex]);

        while (queue.length > 0) {
            const currentIndex = queue.shift()!;
            connected.add(currentIndex);

            const row = Math.floor(currentIndex / gridCols);
            const col = currentIndex % gridCols;

            const neighbors = [currentIndex - gridCols, currentIndex + 1, currentIndex + gridCols, currentIndex - 1];
            if (row === 0) neighbors[0] = -1;
            if (col === gridCols - 1) neighbors[1] = -1;
            if (row === gridRows - 1) neighbors[2] = -1;
            if (col === 0) neighbors[3] = -1;

            for (const neighborIndex of neighbors) {
                if (neighborIndex >= 0 && neighborIndex < cubes.length && !visited.has(neighborIndex)) {
                    const neighborCube = cubes[neighborIndex];
                    if (neighborCube && !neighborCube.isEmpty && neighborCube.color === clickedCube.color) {
                        visited.add(neighborIndex);
                        queue.push(neighborIndex);
                    }
                }
            }
        }

        if (connected.size <= 1) {
            const newMistakeCount = mistakes + 1;
            setMistakes(newMistakeCount);
            if (newMistakeCount >= maxMistakes) {
                onGameEnd('lose');
            }
        } else {
            let newCubes = [...cubes];
            connected.forEach(index => { newCubes[index] = { ...newCubes[index], isEmpty: true }; });
            for (let col = 0; col < gridCols; col++) {
                let emptySlots = 0;
                for (let row = gridRows - 1; row >= 0; row--) {
                    const index = row * gridCols + col;
                    if (newCubes[index].isEmpty) {
                        emptySlots++;
                    } else if (emptySlots > 0) {
                        [newCubes[index], newCubes[(row + emptySlots) * gridCols + col]] = [newCubes[(row + emptySlots) * gridCols + col], newCubes[index]];
                    }
                }
            }
            const emptyCols: number[] = [];
            for (let col = 0; col < gridCols; col++) {
                if (newCubes.slice(col, gridRows * gridCols).filter((_, i) => i % gridCols === 0).every(c => c.isEmpty)) {
                    emptyCols.push(col);
                }
            }
            if (emptyCols.length > 0) {
                let tempCubes = Array.from({length: gridRows * gridCols}, () => ({id: -1, color: 'cuber', isEmpty: true} as CubeState));
                let newCol = 0;
                for (let oldCol = 0; oldCol < gridCols; oldCol++) {
                    if (!emptyCols.includes(oldCol)) {
                        for (let row = 0; row < gridRows; row++) {
                            tempCubes[row * gridCols + newCol] = newCubes[row * gridCols + oldCol];
                        }
                        newCol++;
                    }
                }
                newCubes = tempCubes;
            }
            setCubes(newCubes);

            if (newCubes.every(c => c.isEmpty)) {
                onGameEnd('win');
            }
        }
    }, [cubes, gridCols, gridRows, maxMistakes, mistakes, onGameEnd]);

    const getImageForColor = (color: string) => {
        if (color === 'cuber') return '/images/image1.svg';
        if (color === 'cubeg') return '/images/image2.svg';
        return '/images/image3.svg';
    };

    return (
        <div className="hack-box-container">
            <div className="lock-container">
                {cubes.map((cube, index) => (
                    <div key={index} className={`cube ${cube.isEmpty ? 'empty' : ''}`} onClick={() => handleCubeClick(index)}>
                        {!cube.isEmpty && <img src={getImageForColor(cube.color)} alt={cube.color} />}
                    </div>
                ))}
            </div>
            <div className="timer-container">
                <div className="timer-progress-bar"></div>
            </div>
            <div style={{marginTop: '10px', color: '#aaa', fontSize: '0.9rem'}}>
                Mistakes: {mistakes} / {maxMistakes}
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT (No changes here) ---
export default function SOSPage() {
    const [gameState, setGameState] = useState<'config' | 'playing' | 'win' | 'lose'>('config');
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        injectCss();
    }, []);

    const handleGameStart = (newSettings: any) => {
        setSettings(newSettings);
        setGameState('playing');

        document.documentElement.style.setProperty('--grid-columns', String(newSettings.gridCols));
        document.documentElement.style.setProperty('--grid-rows', String(newSettings.gridRows));
    };

    const handleGameEnd = (outcome: 'win' | 'lose') => {
        setGameState(outcome);
    };

    const handlePlayAgain = () => {
        setGameState('config');
        setSettings(null);
    };

    return (
        <div className="game-root-container">
            {gameState === 'config' && <ConfigScreen onStart={handleGameStart} />}

            {gameState === 'playing' && settings && (
                <GameScreen settings={settings} onGameEnd={handleGameEnd} />
            )}

            {(gameState === 'win' || gameState === 'lose') && (
                <div className="game-overlay">
                    <h2 className={gameState}>{gameState === 'win' ? 'Success!' : 'Failed!'}</h2>
                    <Button onClick={handlePlayAgain} size="lg">
                        Play Again
                    </Button>
                </div>
            )}
        </div>
    );
}