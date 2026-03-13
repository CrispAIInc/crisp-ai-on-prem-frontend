import React, { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';
import BaseHeading from '../BaseHeading';

function FindMomentsList({ setCurrentMoment, setShowList, moments }) {

    const {
        theme,
        knowledgeBase
    } = useContext(MainContext);

    function handleSelectResult(item) {
        const fullShapeResult = item.results.map(result => {
            let source = knowledgeBase.find(item => item.source_id === result.source_id);

            if (source) {
                return {
                    ...result,
                    timestampText: `${source.source_path} | ${result.timestamp}`,
                    source: {
                        ...source,
                        timestamp: result.timestamp,
                    },
                };
            }
        });
        setCurrentMoment({
            ...item,
            results: fullShapeResult
        });
        setShowList(false);
    }

    return (
        <div className="flex flex-col gap-2 overflow-y-auto">
            <BaseHeading text="All moments" />
            <div className='flex flex-col gap-1'>
                {
                    moments.map(item => (
                        <p onClick={() => handleSelectResult(item)} key={item.id} className={`${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'} cursor-pointer w-fit hover:font-medium`}>{item.prompt}</p>
                    ))
                }
            </div>
        </div>
    );
}

export default FindMomentsList;