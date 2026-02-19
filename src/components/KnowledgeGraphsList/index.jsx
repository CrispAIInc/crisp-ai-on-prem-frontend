import React, { useContext, useEffect, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';
import BaseHeading from '../BaseHeading';
import { searchByKey, sortByKey } from '../../utils';
import KnowledgeGraphModal from '../KnowledgeGraphModal';

const KnowledgeGraphsList = () => {

    const {
        theme,
        knowledgeGraphs,
        setSelectedKnowledgeGraph
    } = useContext(MainContext);

    const [searchValue, setSearchValue] = useState("");
    const [graphsResults, setGraphsResults] = useState(knowledgeGraphs);
    const [showGraphModal, setShowGraphModal] = useState(false);

    const handleGraphsSearch = (e) => {
        const value = e?.target?.value || "";
        setSearchValue(value);

        if (value.trim() === "") {
            setGraphsResults(sortByKey(knowledgeGraphs, "title"));
        } else {
            const filtered = searchByKey(knowledgeGraphs, "title", value);
            setGraphsResults(sortByKey(filtered, "title"));
        }
    };

    useEffect(() => {
        setGraphsResults(sortByKey(knowledgeGraphs, "title"));
        handleGraphsSearch();
    }, [knowledgeGraphs]);

    function handleGraphClick(graph) {
        setSelectedKnowledgeGraph(graph);
        setShowGraphModal(true);
    }

    return (
        <>
            {
                (knowledgeGraphs.length > 0 || graphsResults.length > 0) ? (
                    <>
                        <BaseHeading text="Your composers" />
                        <input
                            className={`py-1 text-sm bg-transparent outline-none ${theme === 'light' ? '!border !border-textColor-100' : '!border !border-textColor-200 text-textColor-100'} w-full  rounded-full !pl-[10px]`}
                            placeholder={"Search..."}
                            value={searchValue}
                            onChange={handleGraphsSearch}
                        />
                        <div className="overflow-y-auto h-full">
                            {
                                graphsResults.map((graph, index) => (
                                    <div key={index} className={`p-2 rounded-md cursor-pointer ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-700'} transition-colors`}>
                                        <p className={`font-semibold ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`} onClick={() => handleGraphClick(graph)}>{graph.title}</p>
                                    </div>
                                ))
                            }
                        </div>
                    </>
                ) : (
                    <BaseHeading text="No composers found" className={`text-center mt-4 ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`} />
                )
            }

            {showGraphModal && <KnowledgeGraphModal show={showGraphModal} onHide={() => setShowGraphModal(false)} />}
        </>
    );
};

export default KnowledgeGraphsList;