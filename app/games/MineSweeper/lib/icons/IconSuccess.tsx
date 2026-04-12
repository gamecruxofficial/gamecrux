import React from 'react';

const IconSuccess: React.FC<{ className?: string }> = ({ className = '' }) => (
    <svg
        className={`w-[60%] h-[60%] ${className}`}
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <polyline
            points="3,8 7,12 12,4"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="stroke-success"
        />
    </svg>
);

export default IconSuccess;
