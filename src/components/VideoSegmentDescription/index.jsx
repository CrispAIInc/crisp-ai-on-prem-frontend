import React, { useContext, useState } from 'react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import BaseHeading from '../BaseHeading';
import { MainContext } from '../../contexts/mainContext';
import TimeSegmentDescription from '../TimeSegmentDescription';
import SegmentDescription from '../SegmentDescription';
import SegmentDescriptionResult from "../SegmentDescriptionResult";

import { formatTime } from "../../utils.js";

const VideoSegmentDescription = ({ start, setStart, end, setEnd, generateDescription }) => {

    const { theme } = useContext(MainContext);

    const [currentTab, setCurrentTab] = useState("Time segment description");

    return (
        <div className="h-full flex flex-col">
            <div className="relative z-10 flex flex-col gap-1 mt-2 mb-3">
                {
                    [
                        {
                            icon: NotesOutlinedIcon,
                            title: "Time segment description"
                        },
                        {
                            icon: AutoAwesomeIcon,
                            title: "Time segment summary"
                        },
                        {
                            icon: AccessTimeOutlinedIcon,
                            title: "Find moments"
                        },
                    ].map(({ icon: Icon, title }, index) => {
                        return (
                            <div className={`cursor-pointer flex items-center gap-1 pb-1 ${title === currentTab ? ' !text-primary-300' : ''}`} key={title} onClick={() => setCurrentTab(title)}>
                                <Icon className={`${title !== currentTab && (theme === 'light' ? 'text-textColor-200' : 'text-[#ABAEB4]')}`} />
                                <BaseHeading key={index} text={title} className={` font-extrabold !text-[12px] ${title === currentTab ? ' !text-primary-300' : ''}`} />
                            </div>
                        );
                    })
                }
            </div>
            <SegmentDescription
                start={start}
                setStart={setStart}
                end={end}
                setEnd={setEnd}
                handleGenerate={generateDescription} />

            <SegmentDescriptionResult
                start={formatTime(start)}
                end={formatTime(end)}
                // description={generateDescription ? generateDescription(start, end) : "this is a random by deafult description generated manually for testing purposes. It should be replaced by the actual generated description based on the selected time segment."}
                description={"this is a random by deafult description generated manually for testing purposes. It should be replaced by the actual generated description based on the selected time segment. this is a random by deafult description generated manually for testing purposes. It should be replaced by the actual generated description based on the selected time segment this is a random by deafult description generated manually for testing purposes. It should be replaced by the actual generated description based on the selected time segmentthis is a random by deafult description generated manually for testing purposes. It should be replaced by the actual generated description based on the selected time segment this is a random by deafult description generated manually for testing purposes. It should be replaced by the actual generated description based on the selected time segment this is a random by deafult description generated manually for testing purposes. It should be replaced by the actual generated description based on the selected time segment this is a random by deafult description generated manually for testing purposes. It should be replaced by the actual generated description based on the selected time segment this is a random by deafult description generated manually for testing purposes. It should be replaced by the actual generated description based on the selected time segment this is a random by deafult description generated manually for testing purposes. It should be replaced by the actual generated description based on the selected time segment FINAL"}
                exportFn={() => {
                    const textToExport = `Segment: ${start} - ${end}\nDescription: ${generateDescription ? generateDescription(start, end) : ""}`;
                    const blob = new Blob([textToExport], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "segment-description.txt";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }}
            />
        </div>
    );
};

export default VideoSegmentDescription;