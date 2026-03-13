import React, { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

function FindMomentsList({ setCurrentMoment, setShowList, moments }) {

    const { knowledgeBase } = useContext(MainContext);

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
        console.log({
            ...item,
            results: fullShapeResult
        });
        setCurrentMoment({
            ...item,
            results: fullShapeResult
        });
        setShowList(false);
    }

    return (
        <div className="flex flex-col overflow-y-auto">
            {
                moments.map(item => (
                    <p onClick={() => handleSelectResult(item)} key={item.id}>{item.prompt}</p>
                ))
            }
        </div>
    );
}

export default FindMomentsList;