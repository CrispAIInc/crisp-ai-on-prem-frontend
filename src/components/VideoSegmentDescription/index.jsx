import React, { useContext, useEffect, useState } from 'react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import BaseHeading from '../BaseHeading';
import { MainContext } from '../../contexts/mainContext';
import TimeSegmentDescription from '../TimeSegmentDescription';
import SegmentDescription from '../SegmentDescription';
import SegmentDescriptionResult from "../SegmentDescriptionResult";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { formatTime } from "../../utils.js";
import FindMoments from '../FindMoments/index.jsx';
import makeApiRequest, { axiosInstance } from '../../api/index.js';
import { ProjectContext } from '../../contexts/projectContext.jsx';
import { AuthContext } from '../../contexts/authContext.jsx';

const VideoSegmentDescription = () => {

    const { currentProject } = useContext(ProjectContext);
    const {
        theme,
        currentChat
    } = useContext(MainContext);

    const {
        user
    } = useContext(AuthContext);

    const [currentTab, setCurrentTab] = useState("Time segment description");

    // ========== time segment description ==============
    const [startSegmentDescription, setStartSegmentDescription] = useState({ h: "00", m: "00", s: "00" });
    const [endSegmentDescription, setEndSegmentDescription] = useState({ h: "00", m: "00", s: "00" });

    const [promptSegmentDescription, setPromptSegmentDescription] = useState("");

    const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);

    const [resultsDescription, setResultsDescription] = useState({
        start: formatTime(startSegmentDescription),
        end: formatTime(endSegmentDescription),
        description: "",
        refs: []
    });

    // ========== time segment summary ==============
    // const [startSegmentSummary, setStartSegmentSummary] = useState({ h: "00", m: "00", s: "00" });
    // const [endSegmentSummary, setEndSegmentSummary] = useState({ h: "00", m: "00", s: "00" });

    // const [promptSegmentSummary, setPromptSegmentSummary] = useState("");

    // const [resultsSummary, setResultsSummary] = useState({
    //     start: formatTime(startSegmentSummary),
    //     end: formatTime(endSegmentSummary),
    //     description: "",
    //     refs: []
    // });

    // ========= Find moments in videos ===========
    const [captionPrompt, setCaptionPrompt] = useState("");
    const [captionRefs, setCaptionRefs] = useState([]);
    const [moments, setMoments] = useState([]);
    const [captionResults, setCaptionResults] = useState({
        prompt: "",
        context: "",
        refs: [],
    });

    useEffect(() => {

        async function fetchFindMoments() {
            try {
                axiosInstance.defaults.headers.common['ProjectId'] = currentProject.project_id;
                const { data, success } = await makeApiRequest("/chat/timestamp-lookups", 'GET', null, {
                    ProjectId: currentProject.project_id,
                });
                setMoments(data);
            } catch (error) {
                console.log(error);
            }
        }

        fetchFindMoments();
    }, []);

    return (
        <div className="h-full flex flex-col">
            <div className="relative z-10 flex flex-col gap-1 mt-2 mb-3">
                {
                    [
                        {
                            icon: AutoAwesomeIcon,
                            title: "Time segment description"
                        },
                        {
                            icon: AccessTimeOutlinedIcon,
                            title: "Find moments"
                        },
                    ].map(({ icon: Icon, title }, index) => {
                        return (
                            <div className={`relative cursor-pointer flex items-center gap-1 pb-1 w-fit ${title === currentTab ? ' !text-primary-300' : ''}`} key={title} onClick={() => setCurrentTab(title)}>
                                <Icon className={`${title !== currentTab && (theme === 'light' ? 'text-textColor-200' : 'text-[#ABAEB4]')}`} />
                                <BaseHeading key={index} text={title} className={` font-extrabold !text-[12px] ${title === currentTab ? ' !text-primary-300' : ''}`} />
                                {
                                    title === "Time segment description" && (
                                        <>
                                            <InfoOutlinedIcon onMouseOver={() => setIsInfoTooltipOpen(true)} onMouseLeave={() => setIsInfoTooltipOpen(false)} className={`!relative !w-5`} />

                                            {
                                                isInfoTooltipOpen && (
                                                    <div className={`absolute right-0 p-2 bg-background_workspace shadow-md rounded-md w-[300px] max-w-[300px] left-0 z-40 top-full ${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'} text-sm`}>If you specify query, the response will be based on your contextual query, otherwise you get frame-by-frame descriptions of the segment.</div>
                                                )
                                            }
                                        </>
                                    )
                                }
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
                ) : (
                    <FindMoments
                        moments={moments}
                        FindMoments={FindMoments}
                        captionResults={captionResults}
                        setCaptionResults={setCaptionResults}
                    />
                )
            }
        </div>
    );
};

export default VideoSegmentDescription;