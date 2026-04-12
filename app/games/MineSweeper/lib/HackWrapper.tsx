import React from 'react';
import { cn } from '../misc'
import { motion } from 'framer-motion';
import Hexagon from './Hexagon';
import IconLoading from './icons/IconLoading';
import IconSuccess from './icons/IconSuccess';
import IconFail from './icons/IconFail';

interface HackWrapperProps {
    state?: string;
    subtitle?: string;
    title?: string[];
    iterations?: number;
    iteration?: number;
    progress?: number;
    className?: string;
    children?: React.ReactNode;
}

const HackWrapper: React.FC<HackWrapperProps> = ({
    state = null,
    subtitle = null,
    title = null,
    iterations = 1,
    iteration = 0,
    progress = 0,
    className = '',
    children,
}) => {
    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={cn(
                'bg-solid center flex flex-col items-center justify-center p-[1vh] gap-[1vh] absolute shadow-box',
                className
            )}
        >
            <div className="w-full h-[4vh] z-10 flex flex-row items-center justify-start gap-[1vh] border-primary">
                {title && (
                    <span className="flex flex-row items-center uppercase justify-center font-bold text-[3vh] title">
                        {title.map((titleItem, i) => (
                            <p
                                key={i}
                                className={i === title.length - 1 ? 'text-accent' : ''}
                            >
                                {titleItem}
                            </p>
                        ))}
                    </span>
                )}

                {subtitle && (
                    <p className="text-tertiary/75 font-medium w-full text-[1.5vh]">
                        {subtitle}
                    </p>
                )}

                <Hexagon
                    variant={
                        state === 'success'
                            ? 'success'
                            : state === 'fail'
                            ? 'error'
                            : 'accent'
                    }
                >
                    {state === 'success' ? (
                        <div className="relative grid place-items-center w-full h-full aspect-square">
                            <IconSuccess />
                        </div>
                    ) : state === 'fail' ? (
                        <div className="relative grid place-items-center w-full h-full aspect-square">
                            <IconFail />
                        </div>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative grid place-items-center w-full h-full aspect-square"
                        >
                            <IconLoading />
                        </motion.div>
                    )}
                </Hexagon>
            </div>

            {children}

            {iterations > 0 && (
                <div className="w-full h-[2vh] flex flex-row gap-[1vh] z-10">
                    {Array.from({ length: iterations }).map((_, i) => (
                        <div key={i} className="w-full h-full primary-bg">
                            {i === iteration ? (
                                <div
                                    style={{ width: `${progress}%` }}
                                    className={
                                        (progress === 100 || state === 'fail'
                                            ? 'bg-error glow-error'
                                            : state == null
                                            ? 'bg-accent glow-accent'
                                            : state === 'success'
                                            ? 'bg-success glow-success'
                                            : '') +
                                        ' h-full default-colour-transition ease-linear'
                                    }
                                />
                            ) : iteration > i ? (
                                <div
                                    className={
                                        (progress === 100 || state === 'fail'
                                            ? 'bg-error glow-error'
                                            : state == null
                                            ? 'bg-tertiary'
                                            : state === 'success'
                                            ? 'bg-success glow-success'
                                            : '') +
                                        ' h-full bg-tertiary w-full'
                                    }
                                />
                            ) : null}
                        </div>
                    ))}
                </div>
            )}
            <style jsx>{`
                .title {
                    filter: drop-shadow(0 0 0.5vw rgba(var(--accent) / 0.5));
                }
            `}</style>
        </motion.div>
    );
};

export default HackWrapper;
