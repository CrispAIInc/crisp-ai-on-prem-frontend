import React, { useContext, useEffect, useState } from 'react';
import BaseHeading from '../BaseHeading';
import { MainContext } from '../../contexts/mainContext';
import Chip from '../Chip';
import SourceExplorerItem from '../SourceExplorerItem';

import AddIcon from '@mui/icons-material/Add';
import AnimatedText from '../AnimatedText';
import { searchByKey, sortArrayOfObjects, sortBySourcePath } from '../../utils';

function SourceExplorerBody({
    onHide,
    showIndexModal
}) {

    const {
        theme,
        formatOptions,
        categoryOptions,
        setSelectedFormat,
        selectedCategory,
        setSelectedCategory,
        selectedFormat,
        knowledgeBase,
        isKnowledgeBaseFetching,
    } = useContext(MainContext);

    const [searchValue, setSearchValue] = useState("");
    const [filteredSources, setFilteredSources] = useState(knowledgeBase);


    function handleIndexChange(value) {
        setSelectedCategory(value);
    }

    function handleFormatChange(value) {
        setSelectedFormat(value);
    }

    const openCreateCategoryModal = () => {
        onHide();
        showIndexModal?.();
    };


    // useEffect(() => {
    //     let base = [...knowledgeBase];

    //     if (searchValue.trim() !== "") {
    //         base = searchByKey(base, "source_path", searchValue);
    //     }

    //     setFilteredSources(sortBySourcePath(base));
    // }, [searchValue, knowledgeBase]);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchValue(value);

        // if (value.trim() === "") {
        //     setFilteredSources(sortBySourcePath(filteredSources));
        // } else {
        //     const filtered = searchByKey(filteredSources, "source_path", value);
        //     setFilteredSources(sortBySourcePath(filtered));
        // }
    };

    useEffect(() => {
        let filtered = knowledgeBase;

        // if category is 'all', we return all the sources that match the selected format
        // if format is 'all', we return all the sources that match the selected category, if category is all, we return all sources in knowledgebase

        if (selectedCategory === "all") {
            if (selectedFormat === "all") {
                filtered = knowledgeBase;
            } else {
                filtered = knowledgeBase.filter(source => source.file_type === selectedFormat);
            }
        } else {
            if (selectedFormat === "all") {
                filtered = knowledgeBase.filter(source => {
                    if (typeof source.category === "string") {
                        return source.category === selectedCategory;
                    } else if (Array.isArray(source.category)) {
                        return source.category.includes(selectedCategory);
                    }
                    return false;
                });
            } else {
                filtered = knowledgeBase.filter(source => {
                    if (typeof source.category === "string") {
                        return source.category === selectedCategory && source.file_type === selectedFormat;
                    } else if (Array.isArray(source.category)) {
                        return source.category.includes(selectedCategory) && source.file_type === selectedFormat;
                    }
                    return false;
                });
            }
        }

        const foundSources = searchByKey(filtered, "source_path", searchValue);

        setFilteredSources(sortArrayOfObjects(foundSources, "source_path"));
    }, [selectedCategory, selectedFormat, knowledgeBase, searchValue]);

    return (
        <div className="flex flex-col gap-3 overflow-hidden">
            {/* indexes list */}
            <div className="flex flex-col gap-1">
                <BaseHeading text="Indexes" />
                <div className={`flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:h-1
        [&::-webkit-scrollbar-thumb]:rounded-full ${theme === "light" ? '[&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-neutral-400 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500' : '[&::-webkit-scrollbar-track]:bg-neutral-600 [&::-webkit-scrollbar-thumb]:bg-neutral-800 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-900'}`}>
                    {
                        categoryOptions.map((option, index) => {
                            return (
                                <Chip
                                    key={index}
                                    content={option.label}
                                    handleClick={() => handleIndexChange(option.value)}
                                    cssClasses={`text-xs cursor-pointer`}
                                    isActive={option.value === selectedCategory}
                                />
                            );
                        })
                    }
                    <Chip
                        content={<AddIcon className={`!text-[16px]`} />}
                        cssClasses={`cursor-pointer`}
                        handleClick={openCreateCategoryModal}
                    />

                </div>
            </div>

            {/* formats list */}
            <div className="flex flex-col gap-1">
                <BaseHeading text="Formats" />
                <div className={`flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:h-1
        [&::-webkit-scrollbar-thumb]:rounded-full ${theme === "light" ? '[&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-neutral-400 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500' : '[&::-webkit-scrollbar-track]:bg-neutral-600 [&::-webkit-scrollbar-thumb]:bg-neutral-800 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-900'}`}>
                    {
                        formatOptions.map((option, index) => {
                            return (
                                <Chip
                                    key={index}
                                    content={option.label}
                                    handleClick={() => handleFormatChange(option.value)}
                                    cssClasses={`text-xs cursor-pointer`}
                                    isActive={option.value === selectedFormat}
                                />
                            );
                        })
                    }
                </div>
            </div>

            {/* sources list */}
            <div className="overflow-hidden flex flex-col">
                <div className="flex items-center justify-between gap-1">
                    <BaseHeading text={`Sources${!isKnowledgeBaseFetching ? ` (${filteredSources.length})` : ''}`} className={`mb-2 flex-1`} />
                    <input
                        type="text"
                        placeholder="Search by source name..."
                        value={searchValue}
                        onChange={handleSearch}
                        className={`max-w-60 px-2 py-2 outline-none font-semibold text-sm rounded-md  ${theme === "light" ? "!border !border-gray-300 bg-white text-black" : "!border !border-textColor-300 bg-gray-800 text-white"}`}
                    />
                </div>
                {
                    isKnowledgeBaseFetching ? (
                        <AnimatedText text='Preparing your knowledge base...' cssClasses="font-semibold" />
                    ) : (
                        <>
                            {
                                filteredSources.length > 0 ? (
                                    <div className="relative overflow-hidden flex flex-col">
                                        {/* Top fade */}
                                        <div className={`pointer-events-none absolute top-0 left-0 right-1 h-6 bg-gradient-to-b ${theme === "light" ? "from-[#F9F1FD]" : "from-[#333333]"} to-transparent z-10 `} />

                                        <div className={`flex-1 grid grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-2 py-3 [&::-webkit-scrollbar]:w-1
        [&::-webkit-scrollbar-thumb]:rounded-full ${theme === "light" ? '[&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-neutral-400 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500' : '[&::-webkit-scrollbar-track]:bg-neutral-600 [&::-webkit-scrollbar-thumb]:bg-neutral-800 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-900'}`}>
                                            {filteredSources.map(source => (
                                                <SourceExplorerItem
                                                    key={source.source_id}
                                                    source={source}
                                                />
                                            ))}
                                        </div>

                                        {/* Bottom fade */}
                                        <div className={`pointer-events-none absolute bottom-0 left-0 right-1 h-6 bg-gradient-to-t ${theme === "light" ? "from-[#F9F1FD]" : "from-[#333333]"} to-transparent z-10`} />
                                    </div>
                                ) : (
                                    <BaseHeading text="No sources found" className={`text-sm italic`} />
                                )
                            }
                        </>
                    )
                }
            </div>
        </div>
    );
}

export default SourceExplorerBody;