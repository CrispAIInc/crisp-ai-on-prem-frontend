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
import makeApiRequest from '../../api/index.js';

const VideoSegmentDescription = () => {

    const { theme } = useContext(MainContext);

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
                const { data, success } = makeApiRequest("/chat/timestamp-lookups");
                setMoments([
                    {
                        created_at: 'Fri, 13 Mar 2026 11:57:24 GMT',
                        id: 'Yp2r0dj7hnfb28pub0Ir',
                        project_id: 'd203f9dc-5fa1-4a84-b5a0-76f08220cc71',
                        prompt: 'celebrating',
                        results: [
                            {
                                context:
                                    'The athlete is captured from behind, raising his right arm in a celebratory gesture. Other competitors are partially visible, and the crowd in the stands is lively. The stadium roof and lighting fixtu',
                                score: 0.6254,
                                source_id: 'FrDvSojllaJZaM5njTEI',
                                timestamp: '00:01:18',
                                timestamp_seconds: 78,
                                video_filename: 'Usain Bolt.mp4',
                            },
                        ],
                        results_count: 1,
                        sessionId: null,
                        timestamp_iso: '2026-03-13T11:57:24.706859',
                        user_id: 'kwtnB1dxLsSOCQ5KQEiVTT6m6hI2',
                    },
                    {
                        created_at: 'Fri, 13 Mar 2026 12:05:50 GMT',
                        id: 'ng06aYLKg4zyN0G7eCEI',
                        project_id: 'd203f9dc-5fa1-4a84-b5a0-76f08220cc71',
                        prompt: 'usain bolt',
                        results: [
                            {
                                context:
                                    'But Usain Bolt, such a good start, such a good corner, such a good straight.',
                                score: 0.7254,
                                source_id: 'FrDvSojllaJZaM5njTEI',
                                timestamp: '00:01:31',
                                timestamp_seconds: 91,
                                video_filename: 'Usain Bolt.mp4',
                            },
                            {
                                context:
                                    'On paper, the only man who could conceivably live with Usain Bolt at his best.',
                                score: 0.7205,
                                source_id: 'FrDvSojllaJZaM5njTEI',
                                timestamp: '00:00:29',
                                timestamp_seconds: 29,
                                video_filename: 'Usain Bolt.mp4',
                            },
                            {
                                context: "Bolt's going to win this one.",
                                score: 0.7006,
                                source_id: 'FrDvSojllaJZaM5njTEI',
                                timestamp: '00:01:05',
                                timestamp_seconds: 65,
                                video_filename: 'Usain Bolt.mp4',
                            },
                            {
                                context:
                                    'Athletes are seen sprinting from the starting blocks, captured mid-motion. The blue track lanes and white markings are clear. The Jamaican athlete is among them, wearing his yellow and green uniform. ',
                                score: 0.6915,
                                source_id: 'FrDvSojllaJZaM5njTEI',
                                timestamp: '00:00:54',
                                timestamp_seconds: 54,
                                video_filename: 'Usain Bolt.mp4',
                            },
                            {
                                context:
                                    'The Jamaican athlete is seen from the side, looking upward with a neutral expression. A man in a white shirt with a red logo stands behind him. The background includes a white banner with the IAAF log',
                                score: 0.6841,
                                source_id: 'FrDvSojllaJZaM5njTEI',
                                timestamp: '00:00:18',
                                timestamp_seconds: 18,
                                video_filename: 'Usain Bolt.mp4',
                            },
                            {
                                context:
                                    'A wider shot of the race in progress, showing multiple athletes sprinting on the blue track lanes. The Jamaican athlete is visible among them. The stadium crowd is large and animated, with some fans s',
                                score: 0.6675,
                                source_id: 'FrDvSojllaJZaM5njTEI',
                                timestamp: '00:01:00',
                                timestamp_seconds: 60,
                                video_filename: 'Usain Bolt.mp4',
                            },
                            {
                                context:
                                    'The Jamaican athlete is bent over on the track, hands touching the ground near the starting blocks. He is preparing for a race. The blue track lanes and white lane markings are visible. The background',
                                score: 0.6665,
                                source_id: 'FrDvSojllaJZaM5njTEI',
                                timestamp: '00:00:21',
                                timestamp_seconds: 21,
                                video_filename: 'Usain Bolt.mp4',
                            },
                            {
                                context:
                                    'Final frame shows athletes nearing the finish line on the blue track. The Jamaican athlete is visible in the pack, wearing his yellow and green uniform. The stadium is packed with cheering spectators.',
                                score: 0.6649,
                                source_id: 'FrDvSojllaJZaM5njTEI',
                                timestamp: '00:01:09',
                                timestamp_seconds: 69,
                                video_filename: 'Usain Bolt.mp4',
                            },
                        ],
                        results_count: 8,
                        sessionId: null,
                        timestamp_iso: '2026-03-13T12:05:49.873039',
                        user_id: 'kwtnB1dxLsSOCQ5KQEiVTT6m6hI2',
                    },
                ]);
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