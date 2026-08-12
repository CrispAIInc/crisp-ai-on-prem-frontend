import React, { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

function ScoreChip({ score }) {

    const { theme } = useContext(MainContext);

    return (
        <div className={`p-2 ${score < 50 ? 'text-red-500 bg-red-200' : (theme === 'light' ? 'text-green-500 bg-green-200' : 'text-green-300 bg-green-700')} text-xs rounded-md`}>{score}% score</div>
    );
}

export default ScoreChip;