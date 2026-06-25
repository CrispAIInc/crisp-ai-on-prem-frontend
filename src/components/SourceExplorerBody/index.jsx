import React, { useContext } from 'react';
import BaseHeading from '../BaseHeading';
import { MainContext } from '../../contexts/mainContext';
import Chip from '../Chip';

function SourceExplorerBody() {

    const {
        formatOptions,
        categoryOptions,
        setSelectedFormat,
        selectedCategory,
        setSelectedCategory,
        selectedFormat,
    } = useContext(MainContext);

    function handleIndexChange(value) {
        console.log(value);
        setSelectedCategory(value);
    }

    function handleFormatChange(value) {
        console.log(value);
        setSelectedFormat(value);
    }

    return (
        <div>
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
        </div>
    );
}

export default SourceExplorerBody;