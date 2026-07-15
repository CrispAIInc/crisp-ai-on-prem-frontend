import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useContext, useEffect, useState } from 'react';
import "react-quill/dist/quill.snow.css";
import makeApiRequest from '../../api/index.js';
import { MainContext } from '../../contexts/mainContext.jsx';
import RippleButton from '../RippleButton/index.jsx';
import StoriesList from '../StoriesList/index.jsx';
import { ProjectContext } from '../../contexts/projectContext.jsx';

function GenStories({
    setShowStoriesEditor,
}) {

    const { isProjectReadOnly } = useContext(ProjectContext);

    const {
        selectedStory,
        setSelectedStory,
        displayedSources, theme,
        storyContext, setStoryContext,
        storyStoryline, setStoryStoryline,
        isGeneratingStory, setIsGeneratingStory,
    } = useContext(MainContext);

    const [storyTitle, setStoryTitle] = useState(selectedStory?.story_name);
    useEffect(() => {
        selectedStory?.story_name?.replace(/#/g, "").trim();
        setStoryTitle(selectedStory?.story_name);
    }, [selectedStory?.story_name]);

    async function autoGenerateStory() {
        if (isProjectReadOnly) return;
        setIsGeneratingStory(true);
        const httpPayload = {
            storyContext: storyContext,
            storyline: storyStoryline,
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

            setShowStoriesEditor?.(true);
        } catch (error) {
            console.log(error);
        } finally {
            // setIsGeneratingIntroConlusion(false);
            setIsGeneratingStory(false);
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

    const handleMouseEnter = () => ((storyContext === "" || isProjectReadOnly) && !isGeneratingStory) && setTooltipVisible(true);
    const handleMouseLeave = () => setTooltipVisible(false);

    return (
        <div className="relative z-10 flex flex-col h-full gap-1 overflow-y-hidden">
            {/* context */}
            <div className="relative w-full">
                <textarea
                    className={`w-full p-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-200/50 text-textColor-200" : '!border !border-textColor-100 text-textColor-300'} rounded-xl resize-none focus:outline-none`}
                    rows="1"
                    placeholder="Provide story context"
                    value={storyContext}
                    onChange={(e) => setStoryContext(e.target.value)}
                />
            </div>

            {/* storyline */}
            <div className="relative w-full">
                <textarea
                    className={`w-full p-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-200/50 text-textColor-200" : '!border !border-textColor-100 text-textColor-300'} rounded-xl resize-none focus:outline-none`}
                    rows="1"
                    placeholder="Storyline"
                    value={storyStoryline}
                    onChange={(e) => setStoryStoryline(e.target.value)}
                />
            </div>
            {/* generate button */}
            <div className='relative inline-block' onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}>
                <RippleButton fullWidth cssClasses='flex items-center gap-1 disabled:cursor-not-allowed  p-2'
                    disabled={storyContext === "" || isGeneratingStory || isProjectReadOnly}
                    onClick={!isProjectReadOnly && autoGenerateStory}>
                    {isGeneratingStory ? <><AutoAwesomeIcon color="white" className="animate-customPulse" /> <span className="animate-customPulse">Generating...</span></> : 'Generate story'}
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
                {/* <div className="flex-1 h-full overflow-hidden"> */}
                <StoriesList setShowStoriesEditor={setShowStoriesEditor} />
                {/* </div> */}
            </div>
        </div>
    );
}

export default GenStories;
