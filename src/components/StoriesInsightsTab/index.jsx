import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import { useContext, useState } from 'react';
import "react-quill/dist/quill.snow.css";
import { MainContext } from '../../contexts/mainContext.jsx';
import { ProjectContext } from '../../contexts/projectContext.jsx';
import BaseHeading from '../BaseHeading/index.jsx';

import GenBlogs from '../GenBlogs/index.jsx';
import GenStories from "../GenStories";

function StoriesInsightsTab({
    currentTab,
    setCurrentTab,
    videoStart,
    setVideoStart,
    videoEnd,
    setVideoEnd,
    setPageFrom,
    setPageTo,
    pageFrom,
    pageTo,
    isFullSourceDurationBlog,
    setIsFullSourceDurationBlog,
    handleGenerateBlog,
    context,
    setContext,
    isGeneratinBlog,
    setIsGeneratingBlog,
}) {

    const {
        selectedStory,
        setSelectedStory,
        displayedSources, theme,
    } = useContext(MainContext);

    const [tabs, setTabs] = useState([
        {
            icon: AutoStoriesOutlinedIcon,
            title: "Stories"
        },
        {
            icon: ArticleOutlinedIcon,
            title: "Blogs"
        }
    ]); // Stories | Blogs

    // ==================== blog feature =====================

    // const [pageFrom, setPageFrom] = useState("1");
    // const [pageTo, setPageTo] = useState("22");


    // ==================== blog feature =====================

    return (
        <div className="h-full flex flex-col">
            <div className="relative z-10 flex items-center gap-3 mt-2 mb-3">
                {
                    tabs.map(({ icon: Icon, title }, index) => {
                        return (
                            <div className={`relative cursor-pointer flex items-center gap-1 pb-1 w-fit ${title === currentTab ? ' !text-primary-300' : ''}`} key={title} onClick={() => setCurrentTab(title)}>
                                <Icon className={`${title !== currentTab && (theme === 'light' ? 'text-textColor-200' : 'text-[#ABAEB4]')}`} />
                                <BaseHeading key={index} text={title} className={` font-extrabold !text-[12px] ${title === currentTab ? ' !text-primary-300' : ''}`} />
                            </div>
                        );
                    })
                }
            </div>
            {
                currentTab === "Stories" ? (
                    <GenStories />
                ) : (
                    <GenBlogs
                        videoStart={videoStart}
                        setVideoStart={setVideoStart}
                        videoEnd={videoEnd}
                        setVideoEnd={setVideoEnd}
                        setPageFrom={setPageFrom}
                        setPageTo={setPageTo}
                        pageFrom={pageFrom}
                        pageTo={pageTo}
                        isFullSourceDurationBlog={isFullSourceDurationBlog}
                        setIsFullSourceDurationBlog={setIsFullSourceDurationBlog}
                        handleGenerateBlog={handleGenerateBlog}
                        context={context}
                        setContext={setContext}
                        isGeneratinBlog={isGeneratinBlog}
                        setIsGeneratingBlog={setIsGeneratingBlog}
                    />
                )
            }
        </div>
    );
}

export default StoriesInsightsTab;
