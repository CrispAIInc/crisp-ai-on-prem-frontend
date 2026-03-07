import React, { useContext, useEffect, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';
import BaseHeading from '../BaseHeading';
import { searchByKey, sortByKey } from '../../utils';
import KnowledgeGraphModal from '../JsonEntityModal';
import JsonEntityItem from '../JsonEntityItem';

const KnowledgeGraphsList = () => {

    const {
        theme,
        jsonEntities,
        setSelectedJsonEntity
    } = useContext(MainContext);

    const [searchValue, setSearchValue] = useState("");
    const [jsonEntitysResults, setJsonEntitysResults] = useState(jsonEntities);
    const [showJsonEntityModal, setShowJsonEntityModal] = useState(false);

    const handleJsonEntitiesSearch = (e) => {
        const value = e?.target?.value || "";
        setSearchValue(value);

        if (value.trim() === "") {
            setJsonEntitysResults(sortByKey(jsonEntities, "title"));
        } else {
            const filtered = searchByKey(jsonEntities, "title", value);
            setJsonEntitysResults(sortByKey(filtered, "title"));
        }
    };

    useEffect(() => {
        setJsonEntitysResults(sortByKey(jsonEntities, "title"));
        handleJsonEntitiesSearch();
    }, [jsonEntities]);

    function handleJsonEntityClick(jsonEntity) {
        setSelectedJsonEntity(jsonEntity);
        setShowJsonEntityModal(true);
    }

    return (
        <>
            {
                (jsonEntities.length > 0 || jsonEntitysResults.length > 0) ? (
                    <>
                        <BaseHeading text="Your entities" />
                        <input
                            className={`py-1 text-sm bg-transparent outline-none ${theme === 'light' ? '!border !border-textColor-100' : '!border !border-textColor-200 text-textColor-100'} w-full  rounded-full !pl-[10px]`}
                            placeholder={"Search..."}
                            value={searchValue}
                            onChange={handleJsonEntitiesSearch}
                        />
                        <div className="overflow-y-auto h-full">
                            {
                                jsonEntitysResults.map((jsonEntity) => (
                                    <JsonEntityItem key={jsonEntity.graph_id} jsonEntity={jsonEntity} onClick={() => handleJsonEntityClick(jsonEntity)} />
                                ))
                            }
                        </div>
                    </>
                ) : (
                    <BaseHeading text="No composers found" className={`text-center mt-4 ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`} />
                )
            }

            {showJsonEntityModal && <KnowledgeGraphModal show={showJsonEntityModal} onHide={() => setShowJsonEntityModal(false)} />}
        </>
    );
};

export default KnowledgeGraphsList;