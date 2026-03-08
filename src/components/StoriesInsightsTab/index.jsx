import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import { useContext, useEffect, useState } from 'react';
import "react-quill/dist/quill.snow.css";
import makeApiRequest from '../../api/index.js';
import { MainContext } from '../../contexts/mainContext.jsx';
import BaseHeading from '../BaseHeading/index.jsx';
import InsightsList from "../InsightsList/index.jsx";
import RippleButton from '../RippleButton/index.jsx';
import StoriesList from '../StoriesList/index.jsx';
import { ProjectContext } from '../../contexts/projectContext.jsx';

function StoriesInsightsTab({
    setShowStoriesEditor,
    currentTab,
    setCurrentTab,
    isNewInsight,
    setIsNewInsight
}) {

    const { isProjectReadOnly } = useContext(ProjectContext);

    const {
        selectedStory,
        setSelectedStory,
        displayedSources, theme,
    } = useContext(MainContext);

    const [context, setContext] = useState('');
    const [storyline, setStoryline] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const [storyTitle, setStoryTitle] = useState(selectedStory?.story_name);
    useEffect(() => {
        selectedStory?.story_name?.replace(/#/g, "").trim();
        setStoryTitle(selectedStory?.story_name);
    }, [selectedStory?.story_name]);

    async function autoGenerateStory() {
        if (isProjectReadOnly) return;
        setIsLoading(true);
        const httpPayload = {
            storyContext: context,
            storyline,
            with_checked_sources: displayedSources?.filter(item => item?.is_checked)?.map(item => ({ source_path: item?.source_path, category: item?.category }))
        };
        try {

            if (!displayedSources?.every(item => item?.is_checked === false)) {
                await makeApiRequest(
                    `/handle-embeddings`,
                    "post",
                    JSON.stringify({
                        sources: displayedSources?.filter(item => item?.is_checked)?.map(item => ({ source_path: item?.source_path, category: item?.category })),
                    })
                );
            }

            const res = await makeApiRequest(
                "/auto-generate-story",
                "post",
                httpPayload
            );

            // setSelectedStory({ ...res, story_name: storyTitle || res?.story_name });
            setSelectedStory(prev => ({
                ...prev,
                ...res,
                story_name: storyTitle || res?.story_name,
                text: res.text.map(section => ({
                    ...section,

                    outline: {
                        ...section.outline,
                        nameHtml: `<h3 class="outline-block">${section.outline.name}</h3>`
                    },

                    content: section.content.map(item => ({
                        ...item,
                        answerHtml: `<p class="answer-block">${item.answer}</p>`
                    }))
                }))
            }));

            setShowStoriesEditor(true);
        } catch (error) {
            console.log(error);
        } finally {
            // setIsGeneratingIntroConlusion(false);
            setIsLoading(false);
        }
    }

    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left - 60,
            y: e.clientY - rect.top + 10,
        });
    };

    const handleMouseEnter = () => (context === "" || isProjectReadOnly) && setTooltipVisible(true);
    const handleMouseLeave = () => setTooltipVisible(false);

    return (
        <div className="relative z-10 flex flex-col h-full gap-1">
            {/* context */}
            <div className="relative w-full">
                {/* <label
                    className={`absolute left-2 top-2 text-gray-500  px-1 transition-all duration-200 pointer-events-none
                    ${isActive ? 'text-md -top-7 left-1 text-blue-600' : 'text-base'}`}
                >
                    Write your story outline
                </label> */}
                <textarea
                    className={`w-full p-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-200/50 rounded-md text-textColor-200" : '!border !border-textColor-100 text-textColor-300'} rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    rows="1"
                    placeholder="Provide story context"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                />
            </div>

            {/* storyline */}
            <div className="relative w-full">
                {/* <label
                    className={`absolute left-2 top-2 text-gray-500  px-1 transition-all duration-200 pointer-events-none
                    ${isActive ? 'text-md -top-7 left-1 text-blue-600' : 'text-base'}`}
                >
                    Write your story outline
                </label> */}
                <textarea
                    className={`w-full p-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-200/50 rounded-md text-textColor-200" : '!border !border-textColor-100 text-textColor-300'} rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    rows="1"
                    placeholder="Storyline"
                    value={storyline}
                    onChange={(e) => setStoryline(e.target.value)}
                />
            </div>

            {/* generate outline button */}
            {/* <button onClick={autoGenerateStory} className='relative flex items-center justify-center w-full max-w-full gap-2 py-2 m-auto text-center text-white rounded-md cursor-not-allowed disabled:opacity-50 bg-primary-300/85 hover:bg-primary-300'
                disabled={isLoading}>
                {isLoading ? <><LoadingSpinner isSmall /> Generating...</> : 'Generate outline'}
            </button> */}
            {/* generate button */}
            <div className='relative inline-block' onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}>
                <RippleButton fullWidth cssClasses='flex items-center gap-1 disabled:cursor-not-allowed  p-2'
                    disabled={context === "" || isLoading || isProjectReadOnly}
                    onClick={!isProjectReadOnly && autoGenerateStory}>
                    {isLoading ? <><AutoAwesomeIcon color="white" className="animate-customPulse" /> <span className="animate-customPulse">Generating...</span></> : 'Generate story'}
                </RippleButton>
                {tooltipVisible && (
                    <p
                        // onMouseEnter={() => setTooltipVisible(false)}
                        className={`absolute p-2 text-sm font-semibold rounded shadow-2xl bg-background_workspace top-full ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'} z-20`}
                        style={{ top: position.y, left: position.x, opacity: tooltipVisible ? 1 : 0 }}
                    >
                        {isProjectReadOnly ? "Cannot edit an example project." : "Please provide the context."}
                    </p>
                )}
            </div>

            {/* list of insights and stories */}
            <div className='relative z-10 flex flex-col flex-1 h-full overflow-hidden'>
                <div>
                    {/* <MetadataGen key={0} name="genMetadata" /> */}
                    <div className="relative z-10 flex items-center gap-3 mt-4 mb-3">
                        {
                            [
                                {
                                    icon: ArticleOutlinedIcon,
                                    title: "Insights"
                                },
                                {
                                    icon: AutoStoriesOutlinedIcon,
                                    title: "Stories"
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
                </div>
                {/* notes */}
                {
                    currentTab === "Insights" ?
                        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
                            <InsightsList isNewInsight={isNewInsight}
                                setIsNewInsight={setIsNewInsight} />
                        </div>
                        : currentTab === "Stories" ?
                            <>
                                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
                                    <StoriesList setShowStoriesEditor={setShowStoriesEditor} />
                                </div>
                            </>
                            :
                            null
                }
            </div>
        </div>
    );
}

export default StoriesInsightsTab;
