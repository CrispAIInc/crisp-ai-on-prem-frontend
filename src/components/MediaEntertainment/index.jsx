import { useContext, useEffect, useRef, useState } from 'react';
import { MainContext } from '../../contexts/mainContext.jsx';
import { useToast } from "../../contexts/toastContext";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DeleteIcon from "@mui/icons-material/Delete";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import makeApiRequest from '../../api';
import MetadataVerbosity from '../MetadataVerbosity';
import ReelViewer from '../ReelViewer';
import RippleButton from '../RippleButton';
import useResources from '../../hooks/useResources';
import GsFile from '../GsFile/index.jsx';
import LoadingSpinner from '../LoadingSpinner/index.jsx';
import BaseHeading from '../BaseHeading/index.jsx';
import { searchByKey, sortArrayOfObjects, sortBySourcePath } from '../../utils.js';
import FilenameUpdateModal from "../AppSingleValueModal";
import useFirebase from '../../hooks/useFirebase.js';
import { ProjectContext } from '../../contexts/projectContext.jsx';

// const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
function MediaEntertainment({
    reel,
    setReel,
    checkedSourcesCount,
    setIsReelOpen,
    reels,
    setReels,
    context,
    setContext,
    verbosityValue,
    setVerbosityValue,
    isGeneratingReel,
    setIsGeneratingReel }) {

    const { isSharedProject } = useContext(ProjectContext);

    const { getPublicUrl } = useFirebase();

    const { getReels } = useResources({ setReels });

    const { theme, displayedSources } = useContext(MainContext);

    const [, setContextFocused] = useState(false);

    const { notify } = useToast();

    const [isReelGenerated, setIsReelGenerated] = useState(false);

    function handleChange(event) {
        setVerbosityValue(event.target.value);
    }

    // const [isLoading, setIsLoading] = useState(false);

    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left - 60,
            y: e.clientY - rect.top + 10,
        });
    };

    const MAX_SOURCES_COUNT = 15;
    const handleMouseEnter = () => (checkedSourcesCount === 0 || checkedSourcesCount > MAX_SOURCES_COUNT || isSharedProject) && setTooltipVisible(true);
    const handleMouseLeave = () => setTooltipVisible(false);

    async function generateMedia() {
        if (isSharedProject) return;
        if (reel.title === "") {
            notify({
                variant: "error",
                heading: "Oops!",
                subheading: "Reel title is required!",
            });
            return;
        }
        try {
            setIsReelOpen(false);
            setIsGeneratingReel(true);
            const res = await makeApiRequest('/generate-reel', 'POST', JSON.stringify({
                sources: displayedSources.filter(item => item.is_checked).map(i => ({ filename: i.source_path, category: i.category?.filter(item => item !== 'all')[0] })),
                context,
                title: reel.title,
                verbosityValue: verbosityValue.split(" ")[0]?.toLowerCase() || "short"
            }));


            setReel(res);
            getReels();

            //TODO show video here or in another tab or something
            // setVideoUrl(`${API_ENDPOINT}/${res.reel_video_url}`);
            // setReelTitle(res.title);


            setIsReelGenerated(true);

            // setTimeout(() => {
            //     setIsReelOpen(true);
            // }, 0);

        } catch (error) {
            console.log(error);
            notify({
                variant: "error",
                heading: "Oops!",
                subheading: error?.response?.data?.error || "Somthing went wrong",
            });
        } finally {
            setIsGeneratingReel(false);
        }
    }

    function closeReel() {
        setIsReelOpen(false);
        setIsReelGenerated(false);
        setReel({
            id: "",
            title: "",
            reel_video_url: "",
            thumbnail: ""
        });
    }

    const [reelsSearchValue, setReelsSearchValue] = useState("");
    const [reelsResults, setReelsResults] = useState(reels);
    useEffect(() => {
        setReelsResults(sortBySourcePath(reels));
    }, [reels]);
    const handleReelsSearch = (e) => {
        const value = e?.target?.value || "";
        setReelsSearchValue(value);

        if (value.trim() === "") {
            setReelsResults(sortArrayOfObjects(reels, "title"));
        } else {
            const filtered = searchByKey(reels, "title", value);
            setReelsResults(sortArrayOfObjects(filtered, "title"));
        }
    };

    useEffect(() => {
        handleReelsSearch();
    }, [JSON.stringify(reels)]);

    const [showUpdateReelTitleModal, setShowUpdateReelTitleModal] = useState(false);
    function handleOpenFilenameUpdateModal(event, reel) {
        event.stopPropagation();
        setReelTitleUpdateValue(reel.title);
        setShowUpdateReelTitleModal(true);
    }

    const [hoveredReel, setHoveredReel] = useState(null);
    const hoveredReelRef = useRef(null);
    const handleMouseEnterReel = (id) => {
        setHoveredReel(id);
        hoveredReelRef.current = id;
    };
    const handleMouseLeaveReel = () => {
        setHoveredReel(null);
    };

    const [isReelDeleting, setIsReelDeleting] = useState(false);
    async function deleteReel(event, reel) {
        if (isSharedProject) return;
        event.preventDefault();
        setIsReelDeleting(true);
        try {
            const publicReelUrl = await getPublicUrl(reel.reel_video_url);
            await makeApiRequest('/remove-reel', 'POST', JSON.stringify({
                videoUrl: publicReelUrl,
            }));

            notify({
                variant: "success",
                heading: "Reel deleted successfully!",
            });
            setReels(prev => prev.filter(item => item.id !== reel.id));
            // getReels();
        } catch (error) {
            console.log(error);
            notify({
                variant: "error",
                heading: "Oops!",
                subheading: "An error occurred while deleting the reel",
            });
        } finally {
            setIsReelDeleting(false);
        }
    }

    const [reelTitleUpdateValue, setReelTitleUpdateValue] = useState('');

    const showSelectedReel = (e, reel, index) => {
        setReel(reel);
        setIsReelOpen(true);
    };

    const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(true);

    return (
        <div className='z-20 flex flex-col gap-1 h-full'>

            {/* collapser */}
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsDropdownMenuOpen(!isDropdownMenuOpen)}>
                <p className={`select-none font-bold ${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'}`}>
                    {isDropdownMenuOpen ? "Minimize" : "Expand"} settings
                </p>
                <svg
                    className={`w-4 mx-2 transform ${isDropdownMenuOpen ? "rotate-180" : "rotate-0"
                        }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke={`${theme === 'light' ? 'currentColor' : 'white'}`}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </div>

            <div className={`flex flex-col gap-2 ${isDropdownMenuOpen ? 'block' : 'hidden'}`}>
                {/* context */}
                <div className="relative w-full">
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
                <div className='relative inline-block'
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}>
                    <RippleButton fullWidth cssClasses='flex items-center gap-1 disabled:cursor-not-allowed p-2'
                        disabled={isSharedProject || isGeneratingReel || checkedSourcesCount === 0 || checkedSourcesCount > MAX_SOURCES_COUNT} onClick={!isSharedProject && generateMedia}>
                        {isGeneratingReel ? <><AutoAwesomeIcon color="white" className="animate-customPulse" /> <span className="animate-customPulse">Generating...</span></> : 'Generate'}
                    </RippleButton>
                    {tooltipVisible && (
                        <p
                            // onMouseEnter={() => setTooltipVisible(false)}
                            className={`absolute p-2 text-sm font-semibold rounded shadow-2xl bg-background_workspace top-full ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}
                            style={{ top: position.y, left: position.x, opacity: tooltipVisible ? 1 : 0 }}
                        >
                            {
                                isSharedProject ? "Cannot edit example projects." :
                                    `Select at least one source. (max: ${MAX_SOURCES_COUNT} sources)`
                            }
                        </p>
                    )}
                </div>
            </div>

            {/* ============= list of reels ============= */}
            <div className="flex flex-col mb-2 gap-2 h-full overflow-hidden">
                <BaseHeading text="Your reels" className="mt-2" />
                {(reels?.length > 0 || reelsResults?.length > 0) && (
                    <input
                        className={`py-1 text-sm bg-transparent outline-none ${theme === 'light' ? '!border !border-textColor-100' : '!border !border-textColor-200 text-textColor-100'} w-full  rounded-full !pl-[10px]`}
                        placeholder={"Search..."}
                        value={reelsSearchValue}
                        onChange={handleReelsSearch}
                    />
                )}
                {

                    (reels?.length === 0 || reelsResults?.length === 0) ? <BaseHeading text="No reels found" className={`text-center mt-4 ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`} />
                        :
                        <div className="overflow-y-auto h-full">
                            {reelsResults?.map((reel, index) => (
                                <div key={reel.id} className={`flex items-center gap-2 ${theme === 'light'
                                    ? 'hover:bg-textColor-100/10'
                                    : 'hover:bg-light-hover-200/20'
                                    } cursor-pointer p-2 rounded-md select-none`} onMouseEnter={() => handleMouseEnterReel(reel.id)} onMouseLeave={handleMouseLeaveReel} onClick={(event) => showSelectedReel(event, reel, index)}>

                                    <GsFile className="!w-8 !h-8 !rounded-md" gsUrl={reel?.thumbnail} alt={reel?.title} />
                                    <p className={`font-semibold flex-1 ${theme === "light" ? "text-textColor-300" : "text-textColor-200"
                                        }`}>{reel.title}</p>

                                    {
                                        !isSharedProject && (
                                            hoveredReel === reel?.id && (
                                                <>
                                                    <EditOutlinedIcon
                                                        className={`cursor-pointer ${theme === 'light' ? 'text-[#333]' : 'text-[#ABAEB4]'}`}
                                                        onClick={(event) => { event.stopPropagation(); handleOpenFilenameUpdateModal(event, reel); }}
                                                    />
                                                    {isReelDeleting ? <LoadingSpinner isSmall isDeleting /> : <DeleteIcon
                                                        onClick={(event) => { event.stopPropagation(); deleteReel(event, reel); }}
                                                        className="text-red-400 cursor-pointer"
                                                    />}
                                                </>
                                            )
                                        )
                                    }
                                </div>
                            ))}
                        </div>
                }
            </div>

            {
                showUpdateReelTitleModal && (
                    <FilenameUpdateModal
                        value={reelTitleUpdateValue}
                        setValue={setReelTitleUpdateValue}
                        label="Update reel title"
                        show={showUpdateReelTitleModal}
                        onHide={() => setShowUpdateReelTitleModal(false)}
                        reel={reels.find(r => r.id === hoveredReelRef.current)}
                    />
                )
            }
            {(isReelGenerated) && <ReelViewer closeReel={closeReel} reel={reel} setReel={setReel} reels={reels} setReels={setReels} />}
        </div>
    );
}

export default MediaEntertainment;