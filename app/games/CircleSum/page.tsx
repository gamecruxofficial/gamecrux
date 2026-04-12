'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HackWrapper from '../MineSweeper/lib/HackWrapper'; // Assuming this component exists
import { TLengthHackGameParam, TLevelState } from '../MineSweeper/typings/gameState';
import { TCircleSumGameState, TCirleSumToggle } from '../MineSweeper/typings/circleSum';
import { delay, getRandomIntFromIntOrArray, randomBetween } from '../MineSweeper/misc';

// --- Game Configuration & Helpers ---
const radialConfig = {
    limit: 360,
    min: 12,
    max: 24,
    size: 100, // percentage
    gap: 1, // in degrees
    innerHoleSize: 45, // percentage of radius
};

const degToRad = (deg: number) => deg * (Math.PI / 180);

const point = (centerX: number, centerY: number, radius: number, angle: number) => {
    const radians = degToRad(angle);
    const x = centerX + radius * Math.cos(radians);
    const y = centerY + radius * Math.sin(radians);
    return `${x.toPrecision(5)},${y.toPrecision(5)}`;
};

// --- Component-specific Styles ---
const GameStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
        .circlesum-container {
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
        .circlesum-container * {
            color: rgb(var(--foreground));
            font-family: "Roboto", sans-serif;
        }
        .circlesum-container .bg-primary { background-color: rgb(var(--primary)); }
        .circlesum-container .bg-secondary { background-color: rgb(var(--secondary)); }
        .circlesum-container .text-muted { color: rgba(var(--foreground), 0.7); }
        .circlesum-container .btn-accent { background-color: rgb(var(--accent)); transition: background-color 0.2s; }
        .circlesum-container .btn-accent:hover { background-color: rgba(var(--accent), 0.8); }
        .circlesum-container .border-tertiary\/50 { border-color: rgba(var(--tertiary), 0.5); }
        .circlesum-container .bg-secondary\/90 { background-color: rgba(var(--secondary), 0.9); }
        .circlesum-container .glow-accent { filter: drop-shadow(0 0 0.3vw rgb(var(--accent))); }
        .circlesum-container .glow-success { filter: drop-shadow(0 0 0.3vw rgb(var(--success))); }
        .circlesum-container .glow-error { filter: drop-shadow(0 0 0.3vw rgb(var(--error))); }
        .circlesum-container .fill-accent { fill: rgb(var(--accent)); }
        .circlesum-container .fill-accent\/50 { fill: rgba(var(--accent), 0.5); }
        .circlesum-container .hover\:fill-accent\/75:hover { fill: rgba(var(--accent), 0.75); }
        .circlesum-container .stroke-accent { stroke: rgb(var(--accent)); }
        .circlesum-container .stroke-success { stroke: rgb(var(--success)); }
        .circlesum-container .fill-success\/50 { fill: rgba(var(--success), 0.5); }
        .circlesum-container .stroke-error { stroke: rgb(var(--error)); }
        .circlesum-container .fill-error\/50 { fill: rgba(var(--error), 0.5); }
        .circlesum-container .bg-accent { background-color: rgb(var(--accent)); }
        .circlesum-container .bg-success\/50 { background-color: rgba(var(--success), 0.5); }
        .circlesum-container .bg-error\/50 { background-color: rgba(var(--error), 0.5); }
        .circlesum-container .default-all-transition { transition: all 0.2s; }
    `}</style>
);

// --- Reusable RadialSegment Component ---
interface RadialSegmentProps {
    index: number;
    containerSize: number;
    pieAngle: number;
    radius: number;
    gap: number;
    innerHoleSize: number;
    active: boolean;
    state: TLevelState;
    onHover: (index: number | null) => void;
    onClick: () => void;
    hoveredIndex: number | null;
}

const RadialSegment: React.FC<RadialSegmentProps> = ({ index, containerSize, pieAngle, radius, gap, innerHoleSize, active, state, onHover, onClick, hoveredIndex }) => {
    const hovered = hoveredIndex === index;
    const hoveredRadius = radius + (hovered ? 10 : 0);
    const innerRad = innerHoleSize / 2;
    const centerX = containerSize / 2;
    const isLargeArc = Math.abs(pieAngle * index - pieAngle * (index + 1)) > 180 ? 1 : 0;

    const pathData = `
        M${point(centerX, centerX, innerRad, pieAngle * index + gap)}
        A${innerRad},${innerRad},0,${isLargeArc},1,
        ${point(centerX, centerX, innerRad, pieAngle * (index + 1) - gap)}
        L${point(centerX, centerX, hoveredRadius, pieAngle * (index + 1) - gap)}
        A${hoveredRadius},${hoveredRadius},0,${isLargeArc},0,
        ${point(centerX, centerX, hoveredRadius, pieAngle * index + gap)}
        Z
    `;

    const getClasses = () => {
        if (state === 'success') return 'stroke-success glow-success fill-success/50';
        if (state === 'fail') return 'stroke-error glow-error fill-error/50';
        if (active) return 'fill-accent glow-accent';
        return 'fill-accent/50 hover:fill-accent/75 stroke-accent';
    };

    return (
        <path
            onMouseEnter={() => !state && onHover(index)}
            onMouseLeave={() => onHover(null)}
            onClick={onClick}
            d={pathData}
            className={`default-all-transition stroke-[0.1vw] ${getClasses()} cursor-pointer`}
        />
    );
};

// --- Main Game Component ---
export default function CircleSum() {
    const [circleSumState, setCircleSumState] = useState<TCircleSumGameState | null>(null);
    const [iterationState, setIterationState] = useState<TLevelState>(null);
    const [userDuration, setUserDuration] = useState(0);
    const [userRotation, setUserRotation] = useState(0);
    const [userValue, setUserValue] = useState(0);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [iterations, setIterations] = useState<number | null>(null);
    const [showConfig, setShowConfig] = useState(true);

    // Config state
    const [difficulty, setDifficulty] = useState('normal');
    const [gameDuration, setGameDuration] = useState(10000);
    const [iterationCount, setIterationCount] = useState(3);
    const [toggleCount, setToggleCount] = useState(12);

    const finishIterationRef = useRef<((result: boolean) => void) | null>(null);
    const cleanUpFunctionsRef = useRef<Function[]>([]);
    const containerRef = useRef<SVGSVGElement>(null);
    const circleRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number>();

    const clearCleanUpFunctions = useCallback(() => {
        cleanUpFunctionsRef.current.forEach(fn => fn());
        cleanUpFunctionsRef.current = [];
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    }, []);

    useEffect(() => clearCleanUpFunctions, [clearCleanUpFunctions]);

    useEffect(() => {
        if (circleSumState && userDuration > 0 && !iterationState) {
            const timer = setTimeout(() => {
                if (userDuration < circleSumState.duration) {
                    setUserDuration(prev => prev + 100);
                } else if (finishIterationRef.current) {
                    finishIterationRef.current(false);
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [userDuration, circleSumState, iterationState]);

    const handleGameEnd = useCallback((success: boolean) => {
        clearCleanUpFunctions();
        setCircleSumState(null);
        setIterationState(null);
        setShowConfig(true);
    }, [clearCleanUpFunctions]);

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
    
    const startGame = useCallback(async (iterationsRemaining: number, config: any) => {
        setUserDuration(0);
        setIterationState(null);
        setUserRotation(0);
        setUserValue(0);

        const generateToggles = (length: number): TCirleSumToggle[] => {
            return Array.from({ length }, () => ({
                value: Math.floor(Math.random() * 99) + 1,
                active: false,
            }));
        };

        const generateTarget = (toggles: TCirleSumToggle[]): number => {
            if (toggles.length === 0) return 0;
            let target = 0;
            const selectedIndices = new Set<number>();
            const targetLength = randomBetween(1, toggles.length - 1);
            while (selectedIndices.size < targetLength) {
                const randomIndex = Math.floor(randomBetween(0, toggles.length - 1));
                if (!selectedIndices.has(randomIndex)) {
                    target += toggles[randomIndex].value;
                    selectedIndices.add(randomIndex);
                }
            }
            return target;
        };

        const numToggles = getRandomIntFromIntOrArray(config.length);
        const toggles = generateToggles(numToggles);
        const target = generateTarget(toggles);

        setCircleSumState({
            duration: getRandomIntFromIntOrArray(config.duration),
            target,
            toggles,
            currentIteration: (iterations || 0) - iterationsRemaining + 1,
        });

        const animateRotation = () => {
            setUserRotation(prev => prev + 0.5);
            animationFrameRef.current = requestAnimationFrame(animateRotation);
        };
        animateRotation();

        await delay(500);
        setUserDuration(1);

        const success = await playIteration(config.duration);
        setIterationState(success ? 'success' : 'fail');
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

        const isLastIteration = iterationsRemaining <= 1;
        const timeout = setTimeout(() => {
            if (success && !isLastIteration) {
                startGame(iterationsRemaining - 1, config);
            } else {
                handleGameEnd(success);
            }
        }, 1000);
        cleanUpFunctionsRef.current.push(() => clearTimeout(timeout));

    }, [iterations, handleGameEnd]);

    const startConfiguredGame = () => {
        clearCleanUpFunctions();
        setIterations(iterationCount);
        setShowConfig(false);
        startGame(iterationCount, { duration: gameDuration, length: toggleCount });
    };

    const clickHandler = (index: number) => {
        if (iterationState || !circleSumState) return;

        const newToggles = [...circleSumState.toggles];
        const toggle = newToggles[index];
        toggle.active = !toggle.active;

        const newValue = userValue + (toggle.active ? toggle.value : -toggle.value);
        setUserValue(newValue);

        setCircleSumState(prev => prev ? { ...prev, toggles: newToggles } : null);

        if (newValue === circleSumState.target && finishIterationRef.current) {
            finishIterationRef.current(true);
        }
    };

    const pieAngle = circleSumState ? 360 / circleSumState.toggles.length : 0;
    
    const getCenterCircleSize = () => {
        if (!circleRef.current || !circleSumState) return 0;
        const size = (userValue / circleSumState.target) * circleRef.current.clientWidth;
        return Math.min(size, circleRef.current.clientWidth);
    };

    const getCenterCircleClass = () => {
        if (iterationState === 'success') return 'border-success glow-success bg-success/50';
        if (iterationState === 'fail') return 'border-error glow-error bg-error/50';
        if (circleSumState && userValue > circleSumState.target) return 'glow-error bg-error/50';
        return 'bg-accent glow-accent';
    };

    return (
        <div className="w-full h-full flex items-center justify-center circlesum-container">
            <GameStyles />
            <AnimatePresence mode="wait">
                {showConfig ? (
                    <motion.div key="config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="config-screen bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full flex flex-col items-center">
                        <h1 className="text-3xl font-bold text-center mb-2 text-white">Circle Sum</h1>
                        <p className="mb-6 text-center text-gray-300">Find the right combination to match the target.</p>
                        {/* Config sliders */}
                        <div className="mb-4 w-full">
                            <label className="block text-gray-300 mb-2">Difficulty</label>
                            <select className="w-full p-2 bg-gray-700 text-white rounded" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                                <option value="easy">Easy</option>
                                <option value="normal">Normal</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                        <div className="mb-4 w-full">
                            <label className="block text-gray-300 mb-2">Number of Toggles: {toggleCount}</label>
                            <input type="range" min="8" max="24" step="1" value={toggleCount} onChange={(e) => setToggleCount(parseInt(e.target.value))} className="w-full" />
                        </div>
                        <div className="mb-4 w-full">
                            <label className="block text-gray-300 mb-2">Time Limit: {gameDuration / 1000}s</label>
                            <input type="range" min="5000" max="30000" step="1000" value={gameDuration} onChange={(e) => setGameDuration(parseInt(e.target.value))} className="w-full" />
                        </div>
                        <div className="mb-8 w-full">
                            <label className="block text-gray-300 mb-2">Rounds: {iterationCount}</label>
                            <input type="range" min="1" max="5" value={iterationCount} onChange={(e) => setIterationCount(parseInt(e.target.value))} className="w-full" />
                        </div>
                        <button onClick={startConfiguredGame} className="w-full bg-[#8685ef] hover:bg-[#6c6ad6] text-white p-3 rounded font-bold transition-colors">Start Game</button>
                    </motion.div>
                ) : (
                    <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="game-screen w-full h-full flex items-center justify-center mt-96">
                        {circleSumState && (
                            <HackWrapper state={iterationState} title={['Circle', 'Sum']} subtitle="Find the right combination to match the target." iterations={iterations || 0} iteration={circleSumState.currentIteration} progress={(userDuration / circleSumState.duration) * 100}>
                                <div className="w-[60vh] h-[60vh] grid place-items-center aspect-square rounded-full overflow-hidden relative">
                                    <div ref={circleRef} className="w-1/3 h-1/3 grid place-items-center overflow-hidden aspect-square bg-secondary/90 border-[0.15vh] border-tertiary/50 rounded-full relative z-20">
                                        <div style={{ width: `${getCenterCircleSize()}px` }} className={`aspect-square rounded-full absolute default-all-transition ${getCenterCircleClass()}`} />
                                    </div>

                                    <svg ref={containerRef} style={{ width: `${radialConfig.size}%`, transform: `rotate(${userRotation}deg)` }} className="absolute z-10 overflow-visible aspect-square">
                                        {containerRef.current && circleSumState.toggles.map((item, index) => (
                                            <RadialSegment
                                                key={index}
                                                index={index}
                                                containerSize={containerRef.current!.clientWidth}
                                                pieAngle={pieAngle}
                                                radius={containerRef.current!.clientWidth / 2}
                                                gap={radialConfig.gap}
                                                state={iterationState}
                                                innerHoleSize={(radialConfig.innerHoleSize / 100) * containerRef.current!.clientWidth}
                                                hoveredIndex={hoveredIndex}
                                                onHover={setHoveredIndex}
                                                active={item.active}
                                                onClick={() => clickHandler(index)}
                                            />
                                        ))}
                                    </svg>
                                </div>
                            </HackWrapper>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
