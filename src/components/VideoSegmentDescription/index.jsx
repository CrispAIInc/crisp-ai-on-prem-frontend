import React, { useContext } from 'react';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { MainContext } from '../../contexts/mainContext';
import BaseHeading from '../BaseHeading';
import TimeSegmentDescription from '../TimeSegmentDescription';

import FindMoments from '../FindMoments/index.jsx';

const VideoSegmentDescription = ({
    currentSegmentTab,
    setCurrentSegmentTab,
    isSegmentPending,
    setIsSegmentPending,
    showSegmentList,
    setShowSegmentList,
    currentSegment,
    setCurrentSegment,
    startSegmentDescription,
    setStartSegmentDescription,
    endSegmentDescription,
    setEndSegmentDescription,
    timeSegmentTitle,
    setTimeSegmentTitle,
    momentTitle,
    setMomentTitle,
    promptSegmentDescription,
    setPromptSegmentDescription,
    isInfoTooltipOpen,
    setIsInfoTooltipOpen,
    segmentDescriptions,
    setSegmentDescriptions,
    resultsDescription,
    setResultsDescription,
    generateDescription,
    prompt,
    setPrompt,
    showList,
    setShowList,
    currentMoment,
    setCurrentMoment,
    moments,
    setMoments,
    captionResults,
    setCaptionResults,
    isPending,
    setIsPending,
    handleCaptionSubmit,
}) => {

    const {
        theme,
        checkedSources,
        displayedSources,
        knowledgeBase,
        currentChat,
    } = useContext(MainContext);

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
                            <div className={`relative cursor-pointer flex items-center gap-1 pb-1 w-fit ${title === currentSegmentTab ? ' !text-primary-300' : ''}`} key={title} onClick={() => setCurrentSegmentTab(title)}>
                                <Icon className={`${title !== currentSegmentTab && (theme === 'light' ? 'text-textColor-200' : 'text-[#ABAEB4]')}`} />
                                <BaseHeading key={index} text={title} className={` font-extrabold !text-[12px] ${title === currentSegmentTab ? ' !text-primary-300' : ''}`} />
                                {
                                    title === "Time segment description" && (
                                        <>
                                            <InfoOutlinedIcon onMouseOver={() => setIsInfoTooltipOpen(true)} onMouseLeave={() => setIsInfoTooltipOpen(false)} className={`!relative !w-5`} />

                                            {
                                                isInfoTooltipOpen && (
                                                    <div className={`absolute right-0 p-2 bg-background_workspace shadow-md rounded-md w-[300px] max-w-[300px] left-0 z-40 top-full ${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'} text-sm`}>Analyze a specific video time range and generate precise breakdown.</div>
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
                currentSegmentTab === "Time segment description" ? (
                    <>
                        <TimeSegmentDescription
                            title={timeSegmentTitle}
                            setTitle={setTimeSegmentTitle}
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
                            isSegmentPending={isSegmentPending}
                            setIsSegmentPending={setIsSegmentPending}
                            showSegmentList={showSegmentList}
                            setShowSegmentList={setShowSegmentList}
                            currentSegment={currentSegment}
                            setCurrentSegment={setCurrentSegment}
                            generateDescription={generateDescription}
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
                        title={momentTitle}
                        setTitle={setMomentTitle}
                    />
                )
            }
        </div>
    );
};

export default VideoSegmentDescription;