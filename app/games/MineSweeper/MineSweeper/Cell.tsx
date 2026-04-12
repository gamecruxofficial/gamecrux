import React from 'react';
import { motion } from 'framer-motion';
import { TLevelState } from '../typings/gameState';

interface CellProps {
    mine: boolean;
    bombState: 'success' | 'fail' | null;
    preview: boolean;
    state: TLevelState;
    onClick: () => void;
}

const Cell: React.FC<CellProps> = ({ mine, bombState, preview, state, onClick }) => {
    return (
        <motion.button
            onClick={onClick}
            className={`w-full h-full rounded-md flex items-center justify-center transition-colors duration-200 ${
                state === 'success' ? 'bg-green-500' :
                state === 'fail' ? 'bg-red-500' :
                preview && mine ? 'bg-yellow-500' :
                bombState === 'success' ? 'bg-green-500' :
                bombState === 'fail' ? 'bg-red-500' :
                'bg-gray-700 hover:bg-gray-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {(preview && mine) && (
                <motion.div 
                    className="w-2/3 h-2/3 rounded-full bg-yellow-300"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                />
            )}
            
            {bombState === 'success' && (
                <motion.div 
                    className="w-2/3 h-2/3 rounded-full bg-green-300"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                />
            )}
            
            {bombState === 'fail' && (
                <motion.div 
                    className="w-2/3 h-2/3 rounded-full bg-red-300"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                />
            )}
        </motion.button>
    );
};

export default Cell;
