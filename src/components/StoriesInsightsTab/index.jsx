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
import PageNumbersPicker from '../PageNumbersPicker/index.jsx';
import TimestampPicker from '../TimestampPicker/index.jsx';

import GenStories from "../GenStories";

function StoriesInsightsTab({
    currentTab,
    setCurrentTab,
    setShowStoriesEditor,
}) {

    const { isProjectReadOnly } = useContext(ProjectContext);

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

    const [pageFrom, setPageFrom] = useState("1");
    const [pageTo, setPageTo] = useState("22");


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
                currentTab === "Stories" && (
                    <GenStories />
                )
            }
        </div>
    );
}

export default StoriesInsightsTab;
