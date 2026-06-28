import React, { useContext, useEffect, useState } from 'react';
import BaseHeading from '../BaseHeading';
import { MainContext } from '../../contexts/mainContext';
import Chip from '../Chip';
import SourceExplorerItem from '../SourceExplorerItem';

import AddIcon from '@mui/icons-material/Add';

function SourceExplorerBody({
    onHide,
    showIndexModal
}) {

    const {
        formatOptions,
        categoryOptions,
        setSelectedFormat,
        selectedCategory,
        setSelectedCategory,
        selectedFormat,
        knowledgeBase,
    } = useContext(MainContext);

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

        setFilteredSources(filtered);
    }, [selectedCategory, selectedFormat, knowledgeBase]);

    return (
        <div className="flex flex-col gap-3 overflow-hidden">
            {/* indexes list */}
            <div className="flex flex-col gap-1">
                <BaseHeading text="Indexs" />
                <div className="flex items-center gap-2">
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
                <div className="flex items-center gap-2">
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
                <BaseHeading text={`Sources (${filteredSources.length})`} className={`mb-2`} />

                {
                    filteredSources.length === 0 ? (
                        <BaseHeading text="No sources found" className={`text-sm italic`} />
                    ) : (

                        <div className="flex-1 grid grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-2">
                            {filteredSources.map(source => (
                                <SourceExplorerItem
                                    key={source.source_id}
                                    source={source}
                                />
                            ))}
                        </div>
                    )
                }
            </div>
        </div>
    );
}

export default SourceExplorerBody;