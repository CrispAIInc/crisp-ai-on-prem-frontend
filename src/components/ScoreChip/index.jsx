import React, { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

function ScoreChip({ score }) {

    const { theme } = useContext(MainContext);

    return (
        <div className={`p-2 text-primary-300 ${theme === 'light' ? 'bg-primary-200/50' : 'bg-primary-200/50'} text-xs rounded-md`}>{score}</div>
    );
}

export default ScoreChip;