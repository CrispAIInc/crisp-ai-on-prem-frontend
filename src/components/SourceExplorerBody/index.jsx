import React, { useContext, useEffect, useState } from 'react';
import BaseHeading from '../BaseHeading';
import { MainContext } from '../../contexts/mainContext';
import Chip from '../Chip';
import SourceExplorerItem from '../SourceExplorerItem';

import AddIcon from '@mui/icons-material/Add';
import AnimatedText from '../AnimatedText';
import { searchByKey, sortArrayOfObjects, sortBySourcePath } from '../../utils';
import useResources from '../../hooks/useResources';
import makeApiRequest from '../../api';
import { useToast } from '../../contexts/toastContext';
import ConfirmationModal from '../ConfirmationModal';

function SourceExplorerBody({
    onHide,
    showIndexModal,
    isDeleting,
    clickedIndex,
    deleteResource
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
        setCategoryOptions
    } = useContext(MainContext);

    const { getIndexes } = useResources({ setCategoryOptions });
    const { notify } = useToast();

    const [searchValue, setSearchValue] = useState("");
    const [filteredSources, setFilteredSources] = useState(knowledgeBase);
    const [isManagingSources, setIsManagingSources] = useState(false);
    const [showRemoveIndexModal, setShowRemoveIndexModal] = useState(false);
    const [isIndexDeleting, setIsIndexDeleting] = useState(false);
    const [indexToRemove, setIndexToRemove] = useState("");


    function removeIndex(e, indexValue) {
        e.stopPropagation();
        setIndexToRemove(indexValue);
        setShowRemoveIndexModal(true);
    }

    async function deleteIndex() {
        try {
            setIsIndexDeleting(true);

            // remove sources before index
            const itemsToBeDeleted = knowledgeBase.filter((item) => item.category.includes(indexToRemove));

            if (itemsToBeDeleted.length > 0) {
                await deleteResource(null, itemsToBeDeleted);
            }

            await makeApiRequest(`/remove-index`, 'post', { index: "alpha" });

            getIndexes();

            notify({
                variant: "success",
                heading: "Index deleted!",
            });
            setShowRemoveIndexModal(false);
        } catch (error) {
            console.log(error);
            notify({
                variant: "error",
                heading: "Oops!",
                subheading: error?.response?.data?.error || 'Error deleting index',
            });
        } finally {
            setIsIndexDeleting(false);
        }
    }

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

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchValue(value);
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

            {/* MANAGE SOURCES & INDEXES */}
            <BaseHeading text="Manage sources" className={`text-sm font-semibold cursor-pointer p-2 rounded-md  ${theme === "light" ? "!border !border-gray-300 bg-white text-textColor-200" : "!border !border-textColor-300 bg-gray-800 text-textColor-100"} ${isManagingSources ? '!text-primary-300 !border !border-primary-300' : ""} w-fit ml-auto flex self-end`} onClick={() => setIsManagingSources(!isManagingSources)} />

            {/* indexes list */}
            <div className="flex flex-col gap-1">
                <BaseHeading text="Indexes" />
                <div className={`flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:h-1
        [&::-webkit-scrollbar-thumb]:rounded-full ${theme === "light" ? '[&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-neutral-400 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500' : '[&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:bg-neutral-600 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-700'}`}>
                    {
                        categoryOptions.map((option, index) => {
                            return (
                                <Chip
                                    key={index}
                                    content={option.label}
                                    handleClick={() => handleIndexChange(option.value)}
                                    cssClasses={`text-xs cursor-pointer ${theme === 'light' ? '!border !border-primary-100' : '!border !border-textColor-200/20'}`}
                                    isActive={option.value === selectedCategory}
                                    hasX={option.value !== "all" && isManagingSources}
                                    handleXClicked={(e) => removeIndex(e, option.value)}
                                />
                            );
                        })
                    }
                    <Chip
                        content={<AddIcon className={`!text-[16px]`} />}
                        cssClasses={`cursor-pointer ${theme === 'light' ? '!border !border-primary-100' : '!border !border-textColor-200/20'}`}
                        handleClick={openCreateCategoryModal}
                    />

                </div>

                {/* DELETE INDEX MODAL */}
                <ConfirmationModal show={showRemoveIndexModal} onHide={() => setShowRemoveIndexModal(false)} heading="Are you sure you want to delete this index?" subheading="CAUTION: all sources from this category will be permanently deleted." confirmedFn={deleteIndex} isDeleting={isIndexDeleting} />
            </div>

            {/* formats list */}
            <div className="flex flex-col gap-1">
                <BaseHeading text="Formats" />
                <div className={`flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:h-1
        [&::-webkit-scrollbar-thumb]:rounded-full ${theme === "light" ? '[&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-neutral-400 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500' : '[&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:bg-neutral-600 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-700'}`}>
                    {
                        formatOptions.map((option, index) => {
                            return (
                                <Chip
                                    key={index}
                                    content={option.label}
                                    handleClick={() => handleFormatChange(option.value)}
                                    cssClasses={`text-xs cursor-pointer ${theme === 'light' ? '!border !border-primary-100' : '!border !border-textColor-200/20'}`}
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
                                        <div className={`pointer-events-none absolute top-0 left-0 right-1 h-6 bg-gradient-to-b ${theme === "light" ? "from-background_workspace" : "from-[#333333]"} to-transparent z-10 `} />

                                        <div className={`flex-1 grid grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-2 py-3 [&::-webkit-scrollbar]:w-1
        [&::-webkit-scrollbar-thumb]:rounded-full ${theme === "light" ? '[&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-neutral-400 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500' : '[&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:bg-neutral-600 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-700'}`}>
                                            {filteredSources.map(source => (
                                                <SourceExplorerItem
                                                    key={source.source_id}
                                                    source={source}
                                                    isDeleting={isDeleting}
                                                    clickedIndex={clickedIndex}
                                                    deleteResource={deleteResource}
                                                    isManagingSources={isManagingSources}
                                                />
                                            ))}
                                        </div>

                                        {/* Bottom fade */}
                                        <div className={`pointer-events-none absolute bottom-0 left-0 right-1 h-6 bg-gradient-to-t ${theme === "light" ? "from-background_workspace" : "from-[#333333]"} to-transparent z-10`} />
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