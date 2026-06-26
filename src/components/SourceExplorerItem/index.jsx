import React, { useContext } from 'react';
import GsFile from '../GsFile';

import CircleIcon from '@mui/icons-material/Circle';
import Checkbox from "@mui/material/Checkbox";

import BaseHeading from '../BaseHeading';
import { formatDuration } from '../../utils';
import { MainContext } from '../../contexts/mainContext';

function SourceExplorerItem({ source }) {

    const {
        theme,
        handleCheckboxChange
    } = useContext(MainContext);

    return (
        <div className="flex items-center gap-2 min-w-0">
            {/* thumbnail */}
            <div className="rounded-xl overflow-auto w-14 h-14">
                <GsFile gsUrl={source.thumbnail} className="w-full h-full object-cover" />
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
                    <BaseHeading cssClasses={`text-xs`} text={source.total_pages ? `${source.total_pages} pages` : formatDuration(source.source_duration) || null} />
                </div>
            </div>

            {/* checkbox` */}
            <Checkbox
                className={`flex-shrink-0 p-0 ${theme === "dark" && "border-white text-white"
                    }`}
                checked={source.is_checked}
                onChange={(e) => handleCheckboxChange(e.target?.checked, source)}
                inputProps={{ "aria-label": "Select source" }}
            />
        </div>
    );
}

export default SourceExplorerItem;