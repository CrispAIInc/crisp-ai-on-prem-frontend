import React from 'react';

function TimeSegmentDescriptionList({ timeSegmentDescriptions, setResults, setShowList }) {

    function handleSelectResult(res) {
        setResults(res);
        setShowList(false);
    }

    return (
        <div className="flex flex-col overflow-y-auto">
            {
                timeSegmentDescriptions.map(item => (
                    <p onClick={() => handleSelectResult(item)} key={item.description}>{item.start}</p>
                ))
            }
        </div>
    );
}

export default TimeSegmentDescriptionList;