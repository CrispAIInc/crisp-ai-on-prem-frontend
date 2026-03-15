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
import { ToastContext } from '../../contexts/toastContext.jsx';

const VideoSegmentDescription = () => {

    const { currentProject } = useContext(ProjectContext);
    const {
        theme,
        checkedSources,
        displayedSources,
        knowledgeBase,
    } = useContext(MainContext);

    const { notify } = useContext(ToastContext);

    const [currentTab, setCurrentTab] = useState("Time segment description");

    // ========== time segment description ==============
    const [startSegmentDescription, setStartSegmentDescription] = useState({ h: "00", m: "00", s: "00" });
    const [endSegmentDescription, setEndSegmentDescription] = useState({ h: "00", m: "00", s: "00" });

    const [promptSegmentDescription, setPromptSegmentDescription] = useState("");

    const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);

    const [segmentDescriptions, setSegmentDescriptions] = useState([]);

    const [resultsDescription, setResultsDescription] = useState({
        start: formatTime(startSegmentDescription),
        end: formatTime(endSegmentDescription),
        description: "",
        refs: []
    });

    useEffect(() => {

        async function fetchTimeSegments() {
            try {
                axiosInstance.defaults.headers.common['ProjectId'] = currentProject.project_id;
                const { data, success } = await makeApiRequest("/chat/segment-response", 'GET', null, {
                    ProjectId: currentProject.project_id,
                });

                if (success) {
                    setSegmentDescriptions(data);
                }
            } catch (error) {
                console.log(error);
            }
        }

        fetchTimeSegments();
    }, []);

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

    const [prompt, setPrompt] = useState("");
    const [showList, setShowList] = useState(true);
    const [currentMoment, setCurrentMoment] = useState(null);
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
                const { data, success } = await makeApiRequest("/chat/moment-fetch", 'GET', null, {
                    ProjectId: currentProject.project_id,
                });
                if (success) {
                    setMoments(data);
                }
            } catch (error) {
                console.log(error);
            }
        }

        fetchFindMoments();
    }, []);

    const [isPending, setIsPending] = useState(false);

    async function handleCaptioning(query) {
        let response = await makeApiRequest('/moment-fetch', 'POST', JSON.stringify({
            prompt: query,
            sources: checkedSources.filter(items => items.file_type === "video"),
            fromCrispWiz: false
        }));

        return response;
    }
    async function handleCaptionSubmit() {
        try {
            setIsPending(true);
            if (!displayedSources?.every(item => item?.is_checked === false)) {
                await makeApiRequest(
                    `/handle-embeddings`,
                    "post",
                    JSON.stringify({
                        sources: checkedSources.filter(items => items.file_type === "video")?.map(item => ({ source_path: item?.source_path, category: item?.category })),
                    })
                );
            }
            let { results, success, message, ...rest } = await handleCaptioning(prompt);

            if (success) {
                if (results.length > 0) {
                    const finalResults = results.map((segment) => {
                        const source = knowledgeBase.find(item => item.source_id === segment.source_id);

                        if (!source) return null;

                        return {
                            ...segment,
                            timestampText: `${source.source_path} | ${segment.timestamp}`,
                            source: {
                                ...source,
                                timestamp: segment.timestamp
                            }
                        };
                    }).filter(Boolean);
                    const moment = {
                        ...rest,
                        results: finalResults
                    };

                    setMoments(prev => {
                        return [
                            moment,
                            ...prev,
                        ];
                    });

                    setCurrentMoment(moment);

                    setPrompt("");
                    setIsPending(false);
                    setShowList(false);
                } else {
                    setIsPending(false);
                    notify({
                        variant: "info",
                        heading: "No moments found with the prompt you provided",
                        subheading: "Try providing another prompt for better results"
                    });
                }
            }
            else {
                throw new Error(message);
            }
        } catch (error) {
            notify({
                variant: "error",
                heading: "Couldn't generate moment",
                subheading: error?.message || ""
            });
            console.log(error);
            setIsPending(false);
            setShowList(false);
        }
    }

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
                            segmentDescriptions={segmentDescriptions}
                            setSegmentDescriptions={setSegmentDescriptions}
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
                        setMoments={setMoments}
                        captionResults={captionResults}
                        setCaptionResults={setCaptionResults}
                        prompt={prompt}
                        setPrompt={setPrompt}
                        showList={showList}
                        setShowList={setShowList}
                        currentMoment={currentMoment}
                        setCurrentMoment={setCurrentMoment}
                        isPending={isPending}
                        setIsPending={setIsPending}
                        handleCaptionSubmit={handleCaptionSubmit}
                    />
                )
            }
        </div>
    );
};

export default VideoSegmentDescription;