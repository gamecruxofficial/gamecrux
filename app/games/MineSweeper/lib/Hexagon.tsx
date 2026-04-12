import React, { useRef, useEffect, useState } from 'react';
import { cn } from '../misc';

type Variant = 'accent' | 'success' | 'error' | 'warning';

interface HexagonProps {
    active?: boolean;
    disabled?: boolean;
    strokeWidth?: string;
    variant?: Variant;
    className?: string;
    children?: React.ReactNode;
    onClick?: () => void;
}

const fills: Record<Variant, string> = {
    accent: 'fill-accent',
    success: 'fill-success',
    error: 'fill-error',
    warning: 'fill-warning',
};

const transparentFills: Record<Variant, string> = {
    accent: 'fill-accent/25',
    success: 'fill-success/25',
    error: 'fill-error/25',
    warning: 'fill-warning/25',
};

const Hexagon: React.FC<HexagonProps> = ({
    active = false,
    disabled = false,
    strokeWidth = '1vh',
    variant = 'accent',
    className = '',
    children,
    onClick,
}) => {
    const ref = useRef<HTMLButtonElement>(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (ref.current) {
            setHeight(ref.current.clientHeight);
        }
    }, []);

    const cssVar = `rgb(var(--${variant}))`;
    const fill = fills[variant];
    const transparentFill = transparentFills[variant];
    const filter = active
        ? `drop-shadow(0 0 0.5vh ${cssVar})`
        : disabled
        ? ''
        : `drop-shadow(0 0 0.05vw ${cssVar})`;

    return (
        <button
            ref={ref}
            className={cn(
                'aspect-square h-full grid place-items-center default-all-transition hover:scale-105 active:scale-100',
                className
            )}
            onClick={onClick}
            type="button"
        >
            <div className="w-full h-full grid place-items-center z-10">
                {children}
            </div>
            <svg
                width={height}
                height={height}
                version="1.1"
                style={{ filter }}
                className={`origin-center default-all-transition absolute z-0 ${active ? fill : transparentFill}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 184.751 184.751"
            >
                <path
                    stroke={cssVar}
                    strokeWidth={active || disabled ? '0' : strokeWidth}
                    d="M0,92.375l46.188-80h92.378l46.185,80l-46.185,80H46.188L0,92.375z"
                />
            </svg>
        </button>
    );
};

export default Hexagon;
