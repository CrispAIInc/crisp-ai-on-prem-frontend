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

const VideoSegmentDescription = () => {

    const { theme } = useContext(MainContext);

    const [currentTab, setCurrentTab] = useState("Time segment description");

    // ========== time segment description ==============
    const [startSegmentDescription, setStartSegmentDescription] = useState({ h: "00", m: "00", s: "00" });
    const [endSegmentDescription, setEndSegmentDescription] = useState({ h: "00", m: "00", s: "00" });

    const [promptSegmentDescription, setPromptSegmentDescription] = useState("");

    const [resultsDescription, setResultsDescription] = useState({
        start: formatTime(startSegmentDescription),
        end: formatTime(endSegmentDescription),
        description: "",
        refs: []
    });

    // ========== time segment summary ==============
    const [startSegmentSummary, setStartSegmentSummary] = useState({ h: "00", m: "00", s: "00" });
    const [endSegmentSummary, setEndSegmentSummary] = useState({ h: "00", m: "00", s: "00" });

    const [promptSegmentSummary, setPromptSegmentSummary] = useState("");

    const [resultsSummary, setResultsSummary] = useState({
        start: formatTime(startSegmentSummary),
        end: formatTime(endSegmentSummary),
        description: "",
        refs: []
    });

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

            {
                currentTab === "Time segment description" ? (
                    <>
                        <TimeSegmentDescription
                            key="description"
                            start={startSegmentDescription}
                            setStart={setStartSegmentDescription}
                            end={endSegmentDescription}
                            setEnd={setEndSegmentDescription}
                            prompt={promptSegmentDescription}
                            setPrompt={setPromptSegmentDescription}
                            results={resultsDescription}
                            setResults={setResultsDescription}
                        />
                    </>
                ) : currentTab === "Time segment summary" ? (
                    <>
                        <TimeSegmentDescription
                            key="summary"
                            start={startSegmentSummary}
                            setStart={setStartSegmentSummary}
                            end={endSegmentSummary}
                            setEnd={setEndSegmentSummary}
                            prompt={promptSegmentSummary}
                            setPrompt={setPromptSegmentSummary}
                            results={resultsSummary}
                            setResults={setResultsSummary}
                        />
                    </>
                ) : null
            }
        </div>
    );
};

export default VideoSegmentDescription;