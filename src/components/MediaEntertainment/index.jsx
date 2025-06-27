import { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SelectedSourcesDropdown from "../SelectedSourcesDropdown";
import makeApiRequest from '../../api';
import toast from 'react-simple-toasts';
import MetadataVerbosity from '../MetadataVerbosity';
import ReelViewer from '../ReelViewer';


function MediaEntertainment() {

    const { theme, knowledgeBase, displayedSources } = useContext(MainContext);

    const [, setContextFocused] = useState(false);
    const [context, setContext] = useState('');

    const [selectedSourcesToGen, setSelectedSourcesToGen] = useState([]);

    const [videoUrl, setVideoUrl] = useState("http://localhost:5000/api/video/all/videoplayback.mp4");
    const [reelTitle, setReelTitle] = useState('the height should be taller than 384px at a certain width, the video will be cut off,');
    const [isReelOpen, setIsReelOpen] = useState(true);

    const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);
    const [verbosityValue, setVerbosityValue] = useState('low');
    function handleChange(event) {
        setVerbosityValue(event.target.value);
    }

    const [isLoading, setIsLoading] = useState(false);

    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left - 60,
            y: e.clientY - rect.top + 10,
        });
    };

    const handleMouseEnter = () => displayedSources.filter(i => i.is_selected).length === 0 && setTooltipVisible(true);
    const handleMouseLeave = () => setTooltipVisible(false);

    async function generateMedia() {
        try {
            setIsLoading(true);
            const res = await makeApiRequest('/generate-reel', 'POST', JSON.stringify({
                sources: displayedSources.filter(item => item.is_selected).map(i => ({ filename: i.source_path, category: i.category?.filter(item => item !== 'all')[0] })),
                context,
                verbosityValue
            }));

            console.log(res);

            //TODO show video here or in another tab or something
            setVideoUrl(res.videoUrl);
            setReelTitle(res.title);
            setIsReelOpen(true);
        } catch (error) {
            console.log(error);
            toast(error?.response?.data?.error || "Something went wrong", { className: 'p-2 rounded-md z-20', theme });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className='z-20 flex flex-col gap-3'>
            {/* context */}
            <div className="relative w-full mt-6">
                <label className={`${theme === "dark" ? 'text-textColor-100' : 'text-textColor-200'} font-medium`}>Your reel topic</label>
                <textarea
                    className={`w-full p-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-300 text-textColor-200" : '!border !border-textColor-100 text-textColor-300'} rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    rows="3"
                    placeholder='What do you want your reel to be about?'
                    onFocus={() => setContextFocused(true)}
                    onBlur={() => setContextFocused(false)}
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                />
            </div>

            {/* title */}
            <div className=''>
                <label className={`${theme === "dark" ? 'text-textColor-100' : 'text-textColor-200'} font-medium`}>Your reel title</label>
                <input
                    className={`${theme === 'dark' && 'text-textColor-100'
                        } font-medium p-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-300" : '!border !border-textColor-100'} !outline-none w-full`}
                    placeholder="Write a title for the reel"
                    value={reelTitle}
                    onChange={(e) => setReelTitle(e.target.value)}
                />
            </div>

            {/* Source to generate reel */}
            {/* <SelectedSourcesDropdown selectedOptions={selectedSourcesToGen} setSelectedOptions={setSelectedSourcesToGen} options={knowledgeBase} /> */}

            {/* verbosity */}
            <div className="">
                <label className={` w-fit !relative ${theme === "dark" ? 'text-textColor-100' : 'text-textColor-200'} font-medium flex items-center gap-1`}>
                    Verbosity
                    <InfoOutlinedIcon onMouseOver={() => setIsInfoTooltipOpen(true)} onMouseLeave={() => setIsInfoTooltipOpen(false)} className='!relative !w-5' style={{ color: `${theme === 'light' ? '#777' : '#ABAEB4'}` }} />
                    {isInfoTooltipOpen && <div className="absolute right-0 p-2 bg-background_workspace shadow-[0px_0px_30px_-2px_rgba(82,79,79,0.6)] rounded-md w-[300px] max-w-[300px] left-0 z-40 top-full">Choose the desired <span className="text-primary">quality</span> and <span className="text-primary">complexity</span> for your generated video reel. Higher quality may increase generation time.</div>}
                </label>
                <MetadataVerbosity verbosityValue={verbosityValue} setVerbosityValue={handleChange} disabilityLevel={2} />
            </div>

            {/* generate button */}
            <div className='relative inline-block' onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}>
                <button className='relative flex items-center justify-center w-full max-w-full gap-2 py-2 m-auto text-center text-white rounded-md cursor-not-allowed disabled:opacity-70 bg-primary-300 hover:bg-primary-300'
                    disabled={isLoading || displayedSources.filter(i => i.is_selected).length === 0} onClick={generateMedia}>
                    {isLoading ? <><AutoAwesomeIcon color="primary" className="animate-customPulse" /> <span className="animate-customPulse">Generating...</span></> : 'Generate'}
                </button>
                {tooltipVisible && (
                    <p
                        // onMouseEnter={() => setTooltipVisible(false)}
                        className={`absolute p-2 text-sm font-semibold rounded shadow-2xl bg-background_workspace top-full ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}
                        style={{ top: position.y, left: position.x, opacity: tooltipVisible ? 1 : 0 }}
                    >
                        No source is selected
                    </p>
                )}
            </div>

            {isReelOpen && <ReelViewer closeReel={() => setIsReelOpen(false)} videoUrl={videoUrl} videoTitle={reelTitle} />}
        </div>
    );
}

export default MediaEntertainment;