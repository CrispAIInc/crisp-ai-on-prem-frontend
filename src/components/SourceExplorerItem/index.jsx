import React, { useContext, useState } from 'react';
import GsFile from '../GsFile';

import CircleIcon from '@mui/icons-material/Circle';
import Checkbox from "@mui/material/Checkbox";
import DeleteIcon from "@mui/icons-material/Delete";

import BaseHeading from '../BaseHeading';
import { formatDuration } from '../../utils';
import { MainContext } from '../../contexts/mainContext';
import { ProjectContext } from '../../contexts/projectContext';
import LoadingSpinner from '../LoadingSpinner';

function SourceExplorerItem({
    source,
    isDeleting,
    clickedIndex,
    deleteResource,
    isManagingSources
}) {

    const {
        theme,
        handleCheckboxChange,
        onThumbnailClick
    } = useContext(MainContext);

    const { isProjectReadOnly } = useContext(ProjectContext);

    const handleDeleteSource = (event, source) => {
        event.stopPropagation();
        deleteResource(event, [source]);
    };

    return (
        <div
            className={`flex items-center gap-2 min-w-0 cursor-pointer rounded-xl p-1 ${theme === 'light' ? 'bg-textColor-100/10 hover:bg-textColor-100/20' : '!border !border-textColor-200/10 bg-light-hover-200/5 hover:bg-light-hover-200/10'}`}
            onClick={(event) => onThumbnailClick(event, source)}
        >
            {/* thumbnail */}
            <div className="rounded-xl overflow-auto w-14 h-14 relative">
                <GsFile gsUrl={source.thumbnail} className="w-full h-full object-cover" />
                {
                    (!isProjectReadOnly && isManagingSources) && (
                        <div className={`absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center ${theme === 'light' ? 'bg-white/70' : 'bg-gray-800/70'} rounded-xl`} onClick={(event) => handleDeleteSource(event, source)}>
                            {
                                (isDeleting && clickedIndex?.source_id === source.source_id) ? (
                                    <LoadingSpinner isSmall />
                                ) : (
                                    <DeleteIcon
                                        onClick={(event) => (!isDeleting || clickedIndex.source_path !== source.source_path) && deleteResource(event, [source])}
                                        className="delete-icon cursor-pointer text-primary-300"
                                    />
                                )
                            }
                        </div>
                    )
                }
            </div>

            {/* metadata */}
            <div className="flex-1 min-w-0 flex flex-col">
                <p className="text-sm font-semibold truncate">{source.source_path}</p>
                {/* source metadata */}
                <div className="flex items-center gap-2 whitespace-nowrap overflow-hidden">
                    <BaseHeading cssClasses={`text-xs`} text={typeof (source.category) === "string" ? source.category : source.category[0]} />
                    <CircleIcon className="!text-[5px]" />
                    <BaseHeading cssClasses={`text-xs`} text={source.file_type} />
                    <CircleIcon className="!text-[5px]" />
                    <BaseHeading cssClasses={`text-xs`} text={source.total_pages ? `${source.total_pages} page${source.total_pages > 1 ? 's' : ''}` : formatDuration(source.source_duration) || null} />
                </div>
            </div>

            {/* checkbox` */}
            <Checkbox
                className={`p-0 !ml-1 !border-primary-300 !text-primary-300`}
                checked={source.is_checked}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleCheckboxChange(e.target?.checked, source)}
                inputProps={{ "aria-label": "Select source" }}
            />
        </div>
    );
}

export default SourceExplorerItem;