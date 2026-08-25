import React, { useContext, useEffect, useState } from 'react';
import BaseHeading from '../BaseHeading';
import { MainContext } from '../../contexts/mainContext';
import Chip from '../Chip';
import SourceExplorerItem from '../SourceExplorerItem';

import AddIcon from '@mui/icons-material/Add';
import UploadIcon from '@mui/icons-material/Upload';
import { Search } from 'lucide-react';

import AnimatedText from '../AnimatedText';
import { searchByKey, sortArrayOfObjects } from '../../utils';
import useResources from '../../hooks/useResources';
import makeApiRequest from '../../api';
import { useToast } from '../../contexts/toastContext';
import ConfirmationModal from '../ConfirmationModal';
import { ProjectContext } from '../../contexts/projectContext';

function SourceExplorerBody({
    onHide,
    showIndexModal,
    isDeleting,
    clickedIndex,
    deleteResource,
    onOpenCategoriesModal,
    isManagingSources,
    onFilteredSourcesChange
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

    const { isProjectReadOnly } = useContext(ProjectContext);

    const { getIndexes } = useResources({ setCategoryOptions });
    const { notify } = useToast();

    const [searchValue, setSearchValue] = useState("");
    const [filteredSources, setFilteredSources] = useState(knowledgeBase);
    const [showRemoveIndexModal, setShowRemoveIndexModal] = useState(false);
    const [isIndexDeleting, setIsIndexDeleting] = useState(false);
    const [indexToRemove, setIndexToRemove] = useState("");
    const [sourcesToDelete, setSourcesToDelete] = useState([]);


    function removeIndex(e, indexValue) {
        e.stopPropagation();
        setIndexToRemove(indexValue);
        const itemsToBeDeleted = knowledgeBase.filter((item) => item.category.includes(indexValue));
        setSourcesToDelete(itemsToBeDeleted);
        setShowRemoveIndexModal(true);
    }

    async function deleteIndex() {
        try {
            setIsIndexDeleting(true);

            // remove sources before index
            if (sourcesToDelete.length > 0) {
                await deleteResource(null, sourcesToDelete);
            }

            const { success, message } = await makeApiRequest(`/indexes/${categoryOptions.find(idx => idx.value === indexToRemove)?.id}`, 'DELETE');

            if (!success) {
                throw new Error(message);
            }

            // CHANGE CURRENTCATEGORY IF IT IS THE DELETING ONE
            if (selectedCategory === indexToRemove) {
                setSelectedCategory("all");
            }

            setCategoryOptions(prev => [...prev.filter(item => item.value !== indexToRemove)]);
            notify({
                variant: "success",
                heading: message || "Index deleted!",
            });
            setShowRemoveIndexModal(false);
        } catch (error) {
            console.log(error);
            notify({
                variant: "error",
                heading: error.message || "Couldn't delete index. Please try again later.",
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

    const handleOpenUploadCategoriesModal = () => {
        onHide();
        onOpenCategoriesModal?.();
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
        const sortedSources = sortArrayOfObjects(foundSources, "source_path");

        setFilteredSources(sortedSources);
        onFilteredSourcesChange?.(sortedSources);
    }, [selectedCategory, selectedFormat, knowledgeBase, searchValue, onFilteredSourcesChange]);

    return (
        <div className="flex flex-col gap-3 overflow-hidden">

            {/* indexes list */}
            <div className="flex flex-col gap-1">
                <BaseHeading text="Indexes" />
                <div className={`flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:h-1
        [&::-webkit-scrollbar-thumb]:rounded-full ${theme === "light" ? '[&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-neutral-400 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500' : '[&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:bg-neutral-600 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-700'}`}>
                    {
                        categoryOptions.map((option, index) => {
                            return (
                                <Chip
                                    key={option.id}
                                    content={option.label}
                                    handleClick={() => handleIndexChange(option.value)}
                                    cssClasses={`text-xs cursor-pointer ${theme === 'light' ? '!border !border-primary-100' : '!border !border-textColor-200/20'}`}
                                    isActive={option.value === selectedCategory}
                                    hasX={option.value !== "all" && isManagingSources}
                                    handleXClicked={(e) => removeIndex(e, option.value)}
                                    isPending={isIndexDeleting && option.value === indexToRemove}
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
                <ConfirmationModal
                    show={showRemoveIndexModal}
                    onHide={() => setShowRemoveIndexModal(false)}
                    targetName={indexToRemove}
                    itemCount={sourcesToDelete.length}
                    itemLabel="sources"
                    requireTypedConfirmation={true}
                    confirmedFn={deleteIndex}
                    isDeleting={isIndexDeleting}
                />
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

                <div className="flex items-center justify-between">
                    <BaseHeading text={`Sources${!isKnowledgeBaseFetching ? ` (${filteredSources.length})` : ''}`} className={`mb-2 flex-1`} />

                    <div className='flex items-center gap-2'>

                        <div className={`flex items-center rounded-lg overflow-hidden ${theme === "light" ? "!border !border-gray-300 bg-white text-black" : "!border !border-textColor-200/20 bg-background_workspace text-white"}`}>
                            <Search size={23} className={`pl-2 pr-0 mr-0 !text-primary-300`} />
                            <input
                                type="text"
                                placeholder="Search by source name..."
                                value={searchValue}
                                onChange={handleSearch}
                                className={`max-w-60 px-2 !py-[8px] outline-none text-sm rounded-md border-none bg-transparent`}
                            />
                        </div>

                        {!isProjectReadOnly && (
                            <button
                                type="button"
                                onClick={handleOpenUploadCategoriesModal}
                                className={`inline-flex items-center gap-1 rounded-lg p-2 text-sm font-semibold shadow-sm transition ${theme === "dark" ? "!border !border-textColor-200/20 bg-textColor-300 text-textColor-100 hover:bg-background_workspace" : "!border !border-slate-300/80 bg-white text-textColor-300 hover:bg-light-hover-100"}`}
                            >
                                <UploadIcon className={`text-[10px] text-primary-300`} />
                                <span className="text-sm">New source</span>
                            </button>
                        )}
                    </div>
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
                                        <div className={`pointer-events-none absolute top-0 left-0 right-1 h-6 bg-gradient-to-b ${theme === "light" ? "from-white" : "from-[#333333]"} to-transparent z-10 `} />

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
                                        <div className={`pointer-events-none absolute bottom-0 left-0 right-1 h-6 bg-gradient-to-t ${theme === "light" ? "from-white" : "from-[#333333]"} to-transparent z-10`} />
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