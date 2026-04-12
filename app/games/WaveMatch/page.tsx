'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HackWrapper from '../MineSweeper/lib/HackWrapper'; // Assuming this component exists
import { TGridHackGameParam, TLevelState } from '../MineSweeper/typings/gameState';
import { deepClone, delay, getRandomIntFromIntOrArray } from '../MineSweeper/misc';
import { type TWaveMatchGameState, type TWaveOptions } from '../MineSweeper/typings/waveMatch';

// --- Game Configuration (Ported from gameConfig.ts) ---
const WAVE_MATCH = {
    MATCH_THRESHOLD: 95,
    DEFAULT_WAVE: {
        speed: 0.1,
        amplitude: 50,
        wavelength: 50,
        segmentLength: 10,
        lineWidth: 2,
        timeModifier: 1,
    },
    MIN_WAVE: {
        speed: 0.05,
        amplitude: 5,
        wavelength: 5,
        segmentLength: 5,
        lineWidth: 1,
        timeModifier: 0.2,
    },
    MAX_WAVE: {
        speed: 0.5,
        amplitude: 100,
        wavelength: 100,
        segmentLength: 20,
        lineWidth: 5,
        timeModifier: 2,
    },
    STEP_WAVE: {
        speed: 0.01,
        amplitude: 1,
        wavelength: 1,
        segmentLength: 1,
        lineWidth: 0.5,
        timeModifier: 0.1,
    },
};

// --- Helper: Sine Wave Generator Class ---
class SineWaveGenerator {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private options: TWaveOptions & { strokeStyle: string };
    private time: number = 0;
    private animationFrameId?: number;

    constructor(canvas: HTMLCanvasElement, options: TWaveOptions & { strokeStyle: string }) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.options = options;
        this.startAnimation();
    }

    updateWaveOptions(newOptions: Partial<TWaveOptions & { strokeStyle: string }>) {
        this.options = { ...this.options, ...newOptions };
    }

    private render = () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.beginPath();

        const { speed, amplitude, wavelength, segmentLength, lineWidth, strokeStyle, timeModifier } = this.options;
        const dpr = window.devicePixelRatio || 1;
        const effectiveAmplitude = amplitude * dpr;
        const effectiveWavelength = wavelength * dpr;

        this.time += speed * timeModifier;

        for (let i = 0; i <= this.canvas.width; i += segmentLength) {
            const x = i;
            const y = this.canvas.height / 2 + Math.sin(x / effectiveWavelength + this.time) * effectiveAmplitude;
            this.ctx.lineTo(x, y);
        }

        this.ctx.strokeStyle = strokeStyle;
        this.ctx.lineWidth = lineWidth * dpr;
        this.ctx.stroke();
    }
    
    private animate = () => {
        this.render();
        this.animationFrameId = requestAnimationFrame(this.animate);
    }
    
    startAnimation() {
        if (!this.animationFrameId) {
            this.animate();
        }
    }

    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = undefined;
        }
    }
}


// --- Reusable Wave Component ---
interface WaveProps extends TWaveOptions {
    width: number;
    height: number;
    strokeStyle: string;
}

const Wave: React.FC<WaveProps> = (props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const waveGeneratorRef = useRef<SineWaveGenerator | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = props.width * dpr;
        canvas.height = props.height * dpr;
        canvas.style.width = `${props.width}px`;
        canvas.style.height = `${props.height}px`;

        const { width, height, ...waveOptions } = props;
        waveGeneratorRef.current = new SineWaveGenerator(canvas, waveOptions);

        return () => {
            waveGeneratorRef.current?.destroy();
        };
    }, [props.width, props.height]);

    useEffect(() => {
        if (waveGeneratorRef.current) {
            const { width, height, ...waveOptions } = props;
            waveGeneratorRef.current.updateWaveOptions(waveOptions);
        }
    }, [props]);

    return <canvas ref={canvasRef} className="absolute" />;
};


// --- Reusable Slider Component ---
interface SliderProps {
    min: number;
    max: number;
    step: number;
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled: boolean;
}

const Slider: React.FC<SliderProps> = ({ min, max, step, value, onChange, disabled }) => (
    <div className="w-full flex flex-col items-center gap-1">
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="w-full"
        />
    </div>
);


// --- Component-specific Styles ---
const GameStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
        .wavematch-container {
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
        .wavematch-container * {
            color: rgb(var(--foreground));
            font-family: "Roboto", sans-serif;
        }
        .wavematch-container .bg-primary { background-color: rgb(var(--primary)); }
        .wavematch-container .bg-secondary { background-color: rgb(var(--secondary)); }
        .wavematch-container .text-muted { color: rgba(var(--foreground), 0.7); }
        .wavematch-container .btn-accent { background-color: rgb(var(--accent)); transition: background-color 0.2s; }
        .wavematch-container .btn-accent:hover { background-color: rgba(var(--accent), 0.8); }
        .wavematch-container .border-tertiary\/50 { border-color: rgba(var(--tertiary), 0.5); }
        .wavematch-container .bg-secondary\/90 { background-color: rgba(var(--secondary), 0.9); }
        .wavematch-container .glow-accent { filter: drop-shadow(0 0 0.3vw rgb(var(--accent))); }
        .wavematch-container .glow-success { filter: drop-shadow(0 0 0.3vw rgb(var(--success))); }
        .wavematch-container .glow-error { filter: drop-shadow(0 0 0.3vw rgb(var(--error))); }
        .wavematch-container .bg-accent { background-color: rgb(var(--accent)); }
        .wavematch-container .bg-success\/50 { background-color: rgba(var(--success), 0.5); }
        .wavematch-container .bg-error\/50 { background-color: rgba(var(--error), 0.5); }
    `}</style>
);


// --- Main Game Component ---
export default function WaveMatch() {
    const [waveMatchState, setWaveMatchState] = useState<TWaveMatchGameState | null>(null);
    const [iterationState, setIterationState] = useState<TLevelState>(null);
    const [userDuration, setUserDuration] = useState(0);
    const [iterations, setIterations] = useState<number | null>(null);
    const [showConfig, setShowConfig] = useState(true);

    // Config state
    const [difficulty, setDifficulty] = useState('normal');
    const [gameDuration, setGameDuration] = useState(10000);
    const [iterationCount, setIterationCount] = useState(3);

    const finishIterationRef = useRef<((result: boolean) => void) | null>(null);
    const cleanUpFunctionsRef = useRef<Function[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const clearCleanUpFunctions = useCallback(() => {
        cleanUpFunctionsRef.current.forEach(fn => fn());
        cleanUpFunctionsRef.current = [];
    }, []);

    useEffect(() => clearCleanUpFunctions, [clearCleanUpFunctions]);

    useEffect(() => {
        if (waveMatchState && userDuration > 0 && !iterationState) {
            const timer = setTimeout(() => {
                if (userDuration < waveMatchState.duration) {
                    setUserDuration(prev => prev + 100);
                } else if (finishIterationRef.current) {
                    finishIterationRef.current(false);
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [userDuration, waveMatchState, iterationState]);

    const handleGameEnd = useCallback((success: boolean) => {
        clearCleanUpFunctions();
        setWaveMatchState(null);
        setIterationState(null);
        setShowConfig(true);
    }, [clearCleanUpFunctions]);

    const checkMatch = useCallback(() => {
        setWaveMatchState(prevState => {
            if (!prevState?.userWave || !prevState?.targetWave) return prevState;

            const { userWave, targetWave } = prevState;
            let totalMatch = 0;
            const keys = Object.keys(userWave) as (keyof TWaveOptions)[];
            
            keys.forEach(key => {
                const userValue = userWave[key];
                const waveValue = targetWave[key];
                const minValue = WAVE_MATCH.MIN_WAVE[key];
                const maxValue = WAVE_MATCH.MAX_WAVE[key];

                if (maxValue !== minValue) {
                    const userNorm = (userValue - minValue) / (maxValue - minValue);
                    const waveNorm = (waveValue - minValue) / (maxValue - minValue);
                    totalMatch += (1 - Math.abs(userNorm - waveNorm));
                }
            });

            const matchPercentage = Math.round((totalMatch / keys.length) * 100);
            
            if (matchPercentage >= WAVE_MATCH.MATCH_THRESHOLD && finishIterationRef.current) {
                finishIterationRef.current(true);
            }

            return { ...prevState, match: matchPercentage };
        });
    }, []);

    const startGame = useCallback(async (iterationsRemaining: number, config: any) => {
        setUserDuration(0);
        setIterationState(null);

        const generateTargetWave = (): TWaveOptions => {
            const targetWave = deepClone(WAVE_MATCH.DEFAULT_WAVE);
            for (const key in targetWave) {
                const k = key as keyof TWaveOptions;
                const randomValue = Math.random() * (WAVE_MATCH.MAX_WAVE[k] - WAVE_MATCH.MIN_WAVE[k]) + WAVE_MATCH.MIN_WAVE[k];
                targetWave[k] = Math.round(randomValue / WAVE_MATCH.STEP_WAVE[k]) * WAVE_MATCH.STEP_WAVE[k];
            }
            return targetWave;
        };

        setWaveMatchState({
            duration: getRandomIntFromIntOrArray(config.duration),
            currentIteration: (iterations || 0) - iterationsRemaining + 1,
            userWave: deepClone(WAVE_MATCH.DEFAULT_WAVE),
            targetWave: generateTargetWave(),
            match: 0,
        });

        await delay(100); // Allow state to set before checking match
        checkMatch();

        await delay(500);
        setUserDuration(1);

        const success = await playIteration(config.duration);
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

    }, [iterations, handleGameEnd, checkMatch]);

    const playIteration = async (duration: number): Promise<boolean> => {
        return new Promise<boolean>((resolve) => {
            const finish = (result: boolean) => {
                finishIterationRef.current = null;
                clearTimeout(durationCheck);
                cleanUpFunctionsRef.current = cleanUpFunctionsRef.current.filter(fn => fn !== resolver);
                resolve(result);
            };
            finishIterationRef.current = finish;
            const durationCheck = setTimeout(() => finish(false), duration + 500);
            const resolver = () => resolve(false);
            cleanUpFunctionsRef.current.push(resolver);
        });
    };

    const startConfiguredGame = () => {
        clearCleanUpFunctions();
        setIterations(iterationCount);
        setShowConfig(false);
        startGame(iterationCount, { duration: gameDuration });
    };

    const handleSliderChange = (key: keyof TWaveOptions, value: number) => {
        setWaveMatchState(prev => {
            if (!prev) return null;
            const newUserWave = { ...prev.userWave, [key]: value };
            return { ...prev, userWave: newUserWave };
        });
        checkMatch();
    };

    return (
        <div className="w-full h-full flex items-center justify-center wavematch-container">
            <GameStyles />
            <AnimatePresence mode="wait">
                {showConfig ? (
                    <motion.div key="config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="config-screen bg-primary p-8 rounded-lg max-w-md w-full">
                        <h1 className="text-3xl font-bold text-center mb-6">Wave Match</h1>
                        <p className="text-muted mb-8 text-center">Change the parameters to match the wave.</p>
                        <div className="mb-4">
                            <label className="block text-muted mb-2">Difficulty</label>
                            <select className="w-full p-2 bg-secondary text-white rounded" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                                <option value="easy">Easy</option>
                                <option value="normal">Normal</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-muted mb-2">Time Limit: {gameDuration / 1000}s</label>
                            <input type="range" min="5000" max="30000" step="1000" value={gameDuration} onChange={(e) => setGameDuration(parseInt(e.target.value))} className="w-full" />
                        </div>
                        <div className="mb-8">
                            <label className="block text-muted mb-2">Rounds: {iterationCount}</label>
                            <input type="range" min="1" max="5" value={iterationCount} onChange={(e) => setIterationCount(parseInt(e.target.value))} className="w-full" />
                        </div>
                        <button onClick={startConfiguredGame} className="w-full btn-accent text-white p-3 rounded font-bold">Start Game</button>
                    </motion.div>
                ) : (
                    <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="game-screen w-full h-full flex items-center justify-center mt-96">
                        {waveMatchState && (
                            <HackWrapper state={iterationState} title={['Wave', 'Match']} subtitle="Change the parameters to match the wave." iterations={iterations || 0} iteration={waveMatchState.currentIteration} progress={(userDuration / waveMatchState.duration) * 100}>
                                <div className="w-[80vh] h-[60vh] flex flex-col items-center gap-[5vh]">
                                    <div ref={containerRef} className="w-full h-[40vh] bg-secondary/90 border-[0.15vh] border-tertiary/50 relative">
                                        {containerRef.current && !iterationState && (
                                            <div className="w-full h-full grid place-items-center">
                                                <Wave strokeStyle="rgba(250, 247, 255, 0.5)" {...waveMatchState.targetWave} height={containerRef.current.clientHeight} width={containerRef.current.clientWidth} />
                                                <Wave strokeStyle="rgba(134, 133, 239, 0.5)" {...waveMatchState.userWave} height={containerRef.current.clientHeight} width={containerRef.current.clientWidth} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-full h-[20vh] px-[5vh] flex flex-col items-center justify-center gap-[2vh]">
                                        <div className="w-full h-[2vh] grid place-items-center bg-primary">
                                            <div className={`h-full default-all-transition ${iterationState === 'success' ? 'border-success glow-success bg-success/50' : iterationState === 'fail' ? 'border-error glow-error bg-error/50' : 'bg-accent glow-accent'}`} style={{ width: `${(waveMatchState.match / WAVE_MATCH.MATCH_THRESHOLD) * 100}%` }} />
                                        </div>
                                        <div className="w-full h-full grid grid-cols-3 items-center justify-between gap-[0.5vh]">
                                            {(Object.keys(waveMatchState.userWave) as (keyof TWaveOptions)[]).map(key => (
                                                <Slider
                                                    key={key}
                                                    disabled={!!iterationState}
                                                    value={waveMatchState.userWave[key]}
                                                    min={WAVE_MATCH.MIN_WAVE[key]}
                                                    max={WAVE_MATCH.MAX_WAVE[key]}
                                                    step={WAVE_MATCH.STEP_WAVE[key]}
                                                    onChange={(e) => handleSliderChange(key, parseFloat(e.target.value))}
                                                />
                                            ))}
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
