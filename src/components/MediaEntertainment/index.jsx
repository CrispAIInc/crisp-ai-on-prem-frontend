import { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import makeApiRequest from '../../api';
import toast from 'react-simple-toasts';
import MetadataVerbosity from '../MetadataVerbosity';
import ReelViewer from '../ReelViewer';

// const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
function MediaEntertainment({ reel,
    setReel,
    isReelOpen,
    setIsReelOpen,
    reels,
    setReels }) {

    const { theme, displayedSources } = useContext(MainContext);

    const [, setContextFocused] = useState(false);
    const [context, setContext] = useState('');

    // const [reel, setReel] = useState({
    //     id: "",
    //     title: "",
    //     reel_video_url: "",
    //     thumbnail: ""
    // });
    // const [videoUrl, setVideoUrl] = useState("http://localhost:5000/api/video/all/videoplayback.mp4");
    // const [reelTitle, setReelTitle] = useState('');
    // const [isReelOpen, setIsReelOpen] = useState(false);

    const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);
    const [verbosityValue, setVerbosityValue] = useState('Short (1min)');
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

    const handleMouseEnter = () => (displayedSources.filter(i => i.is_selected).length === 0 || displayedSources.filter(i => i.is_selected).length > 3) && setTooltipVisible(true);
    const handleMouseLeave = () => setTooltipVisible(false);

    async function generateMedia() {
        if (reel.title === "") {
            toast('Reel title is required!', { className: 'p-2 text-white rounded-md !bg-red-600' });
            return;
        }
        try {
            setIsLoading(true);
            const res = await makeApiRequest('/generate-reel', 'POST', JSON.stringify({
                sources: displayedSources.filter(item => item.is_selected).map(i => ({ filename: i.source_path, category: i.category?.filter(item => item !== 'all')[0] })),
                context,
                title: reel.title,
                verbosityValue: verbosityValue.split(" ")[0]?.toLowerCase() || "short"
            }));

            console.log(res);

            setReel(res);

            //TODO show video here or in another tab or something
            // setVideoUrl(`${API_ENDPOINT}/${res.reel_video_url}`);
            // setReelTitle(res.title);
            setIsReelOpen(true);

            const data = await makeApiRequest("/reels", "get");
            setReels(data);
        } catch (error) {
            console.log(error);
            toast(error?.response?.data?.error || "Something went wrong", { className: 'p-2 rounded-md z-20', theme });
        } finally {
            setIsLoading(false);
        }
    }

    function closeReel() {
        setIsReelOpen(false);
        setReel({
            id: "",
            title: "",
            reel_video_url: "",
            thumbnail: ""
        });
    }

    return (
        <div className='z-20 flex flex-col gap-3'>
            {/* context */}
            <div className="relative w-full mt-6">
                <div className="flex flex-col mb-2">
                    <label className={`${theme === "dark" ? 'text-textColor-100' : 'text-textColor-200'} font-medium`}>Your reel topic</label>
                    <span className={`${theme === "dark" ? 'text-textColor-100' : 'text-textColor-200'} text-sm`}>When no context or topic is provided, the reel will be based on the existing highlights.</span>
                </div>
                <textarea
                    className={`w-full p-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-200/50 rounded-md text-textColor-200" : '!border !border-textColor-100 text-textColor-300'} rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                        } font-medium p-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-200/50 rounded-md" : '!border !border-textColor-100'} focus:outline-none w-full focus:ring-2 focus:ring-blue-500`}
                    placeholder="Write a title for the reel"
                    value={reel.title}
                    onChange={(e) => setReel(prev => ({ ...prev, title: e.target.value }))}
                />
            </div>

            {/* Source to generate reel */}
            {/* <SelectedSourcesDropdown selectedOptions={selectedSourcesToGen} setSelectedOptions={setSelectedSourcesToGen} options={knowledgeBase} /> */}

            {/* verbosity */}
            <div>
                <label className={` w-fit !relative ${theme === "dark" ? 'text-textColor-100' : 'text-textColor-200'} font-medium flex items-center gap-1`}>
                    Reel duration
                    {/* <InfoOutlinedIcon onMouseOver={() => setIsInfoTooltipOpen(true)} onMouseLeave={() => setIsInfoTooltipOpen(false)} className='!relative !w-5' style={{ color: `${theme === 'light' ? '#777' : '#ABAEB4'}` }} /> */}
                    {/* {isInfoTooltipOpen && <div className="absolute right-0 p-2 bg-background_workspace shadow-[0px_0px_30px_-2px_rgba(82,79,79,0.6)] rounded-md w-[300px] max-w-[300px] left-0 z-40 top-full">Choose the desired <span className="text-primary">quality</span> and <span className="text-primary">complexity</span> for your generated video reel. Higher quality may increase generation time.</div>} */}
                </label>
                <MetadataVerbosity isFromReel={true} verbosityValue={verbosityValue} setVerbosityValue={handleChange} disabilityLevel={2} />
            </div>

            {/* generate button */}
            <div className='relative inline-block' onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}>
                <button className='relative flex items-center justify-center w-full max-w-full gap-2 py-2 m-auto text-center text-white rounded-md disabled:cursor-not-allowed bg-primary-300'
                    disabled={isLoading || displayedSources.filter(i => i.is_selected).length === 0 || displayedSources.filter(i => i.is_selected).length > 3} onClick={generateMedia}>
                    {isLoading ? <><AutoAwesomeIcon color="white" className="animate-customPulse" /> <span className="animate-customPulse">Generating...</span></> : 'Generate'}
                </button>
                {tooltipVisible && (
                    <p
                        // onMouseEnter={() => setTooltipVisible(false)}
                        className={`absolute p-2 text-sm font-semibold rounded shadow-2xl bg-background_workspace top-full ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}
                        style={{ top: position.y, left: position.x, opacity: tooltipVisible ? 1 : 0 }}
                    >
                        Select up to 3 sources
                    </p>
                )}
            </div>

            {isReelOpen && <ReelViewer closeReel={closeReel} reel={reel} setReel={setReel} reels={reels} setReels={setReels} />}
        </div>
    );
}

export default MediaEntertainment;