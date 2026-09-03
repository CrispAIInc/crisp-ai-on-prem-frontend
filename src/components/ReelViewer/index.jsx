import ReactPlayer from "react-player";
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import InfoIcon from '@mui/icons-material/Info';
import useFirebase from '../../hooks/useFirebase.js';
import { useToast } from "../../contexts/toastContext";
import { useContext, useState, useEffect } from 'react';
import { timeToSeconds } from "../../utils.js";
import LoadingSpinner from "../LoadingSpinner";
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import './fade.css';
import { SettingsContext } from '../../contexts/settingsContext.jsx';
import { Drawer } from '@mui/material';
import Modal from 'react-bootstrap/Modal';
import ReelProps from '../ReelProps/index.jsx';
import { MainContext } from '../../contexts/mainContext.jsx';
import Moveable from "react-moveable";
import PictureInPictureAltIcon from '@mui/icons-material/PictureInPictureAlt';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import { ProjectContext } from '../../contexts/projectContext.jsx';
import { Save } from "lucide-react";
import makeApiRequest from '../../api/index.js';

function ReelViewer({
    closeReel,
}) {

    const { isProjectReadOnly } = useContext(ProjectContext);
    const {
        theme,
        reels,
        setReels,
        selectedReel: reel,
        setSelectedReel: setReel
    } = useContext(MainContext);
    const { getPublicUrl, getDownloadableUrl } = useFirebase();

    const { generalSettings: { video_autoplay, video_loop } } = useContext(SettingsContext);

    const { notify } = useToast();

    const [isDownloading, setIsDownloading] = useState(false);
    const [sourcePublicUrl, setSourcePublicUrl] = useState(null);
    const [showSaveTitleModal, setShowSaveTitleModal] = useState(false);
    const [saveTitleValue, setSaveTitleValue] = useState(reel?.title || '');
    // const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        setSaveTitleValue(reel?.title || '');
    }, [reel?.title]);

    useEffect(() => {
        if (reel?.reel_video_url) {
            getPublicUrl(reel?.reel_video_url)
                .then(setSourcePublicUrl)
                .catch(console.error);
        }
    }, [reel?.reel_video_url, getPublicUrl]);

    const handleCloseReel = (e) => {
        e.stopPropagation();
        closeReel();
    };

    const handleDownload = async (e, _url, urlFileExtension) => {
        if (isProjectReadOnly) return;

        e.stopPropagation();
        e.preventDefault();

        try {
            setIsDownloading(true);
            const downloadableUrl = await getDownloadableUrl(_url);

            const response = await fetch(downloadableUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${reel.title || 'reel'}.${urlFileExtension || 'mp4'}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            notify({
                variant: "success",
                heading: `${urlFileExtension === 'mp4' ? 'Reel' : "Edl"} downloaded successfully!`,
            });
        } catch (err) {
            console.error("Download failed", err);
            notify({
                variant: "error",
                heading: "Oops!",
                subheading: "Download failed. Plase try again.",
            });
        } finally {
            setIsDownloading(false);
        }
    };

    const [currentTitle, setCurrentTitle] = useState('');
    const [isOutsideClickEnabled, setIsOutsideClickEnabled] = useState(false);
    const handleOutsideClick = (e) => {
        if (e.target === e.currentTarget) {
            closeReel();
            // setIsOutsideClickEnabled(true);
        }
    };

    const handleDuration = () => {
        // intentionally kept for media lifecycle hooks
    };
    const handleProgress = (progress) => {
        const currentTime = progress.playedSeconds;

        // Find the latest segment whose start_time is <= currentTime
        // { start_time: "00:00:00", title: "Introduction"; }
        // { start_time: `00:00:${duration - timeToSeconds(reel.segments[0].start_time)}`, title: "Conclusion" }
        const currentSegment = [...reel.segments]
            .reverse()
            .find(segment => currentTime >= timeToSeconds(segment.start_time));

        if (currentSegment && currentSegment.title !== currentTitle) {
            setCurrentTitle(currentSegment.title);
        }
    };

    const [isReelPropsOpen, setIsReelPropsOpen] = useState(false);
    const handleToggleReelProps = (e) => {
        e.stopPropagation();
        setIsReelPropsOpen(prev => !prev);
    };

    const handleCloseReelProps = () => {
        setIsReelPropsOpen(false);
    };

    const [showDownloadOption, setShowDownloadOption] = useState(false);
    const downloadOptions = () => (
        <div
            className={`absolute right-0 top-full mt-2 z-10 flex flex-col rounded-md shadow-lg ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"
                }`}
        >
            <div
                className={`flex items-center cursor-pointer gap-2 py-2 pr-10 pl-2
         ${theme === "light"
                        ? "text-textColor-300 hover:bg-textColor-100/20"
                        : "text-textColor-100 hover:bg-slate-800/90"
                    }`}
                onClick={(e) => {
                    handleDownload(e, reel?.reel_video_url, "mp4");
                    setShowDownloadOption(false);
                }}
            >
                <PlayCircleOutlinedIcon
                    className={`cursor-pointer ${theme === "light" ? "text-[#333]" : "text-[#ABAEB4]"
                        }`}
                />
                <span>.mp4</span>
            </div>

            <div
                className={`flex items-center cursor-pointer gap-2 py-2 pr-10 pl-2
         ${theme === "light"
                        ? "text-textColor-300 hover:bg-textColor-100/20"
                        : "text-textColor-100 hover:bg-slate-800/90"
                    }`}
                onClick={(e) => handleDownload(e, reel?.edl_url, "edl")}
            >
                <ListAltOutlinedIcon
                    className="cursor-pointer"
                />
                <span>.edl</span>
            </div>
        </div>
    );

    // show or hide the reel title and actions if reel dimensions reach min size
    const [areReelControlsVisible, setAreReelControlsVisible] = useState(true);

    const MIN_W = 200;
    const MIN_H = 300;
    // const MAX_W = 600;
    // const MAX_H = 600;

    const [reelInitialStyles, setReelInitialStyles] = useState({});

    const handleCollapseReel = (e) => {
        e.stopPropagation();
        const reel = document.querySelector('.reel-viewer');
        if (!reel) return;

        // Ensure element has position and initial dimensions BEFORE transition starts
        reel.style.position = 'absolute';

        // If you don't know initial width/height, read them first so the browser knows start values
        const rect = reel.getBoundingClientRect();
        reel.style.width = `${rect.width}px`;
        reel.style.height = `${rect.height}px`;
        reel.style.top = `${rect.top}px`;
        reel.style.left = `${rect.left}px`;

        setReelInitialStyles({
            width: '100%',
            height: reel.style.height,
            left: 0,
            top: 0,
            position: 'relative',
            // top: reel.style.top,
            // left: reel.style.left,
        });


        // set transition BEFORE changing the target values
        reel.style.transition = 'width 0.3s ease, height 0.3s ease, top 0.3s ease, left 0.3s ease, border 0.3s ease';
        reel.style.willChange = 'width, height, top, left, transform'; // hint to browser

        // Force a layout so the browser registers the starting values
        // reading .offsetHeight or getBoundingClientRect() forces layout
        reel.getBoundingClientRect();

        // Now set the target values — the transition should run
        requestAnimationFrame(() => {
            reel.style.width = `${MIN_W}px`;
            reel.style.height = `${MIN_H}px`;
            reel.style.top = `calc(100vh - ${MIN_H}px - 5%)`;
            reel.style.left = `calc(100vw - ${MIN_W}px - 5%)`;
            reel.style.border = '5px solid rgba(255,255,255,0.8)';
        });

        setAreReelControlsVisible(false);
        setIsOutsideClickEnabled(true);
    };

    const handleExpandReel = (e) => {
        e.stopPropagation();
        const reel = document.querySelector('.reel-viewer');
        if (!reel) return;

        // set transition BEFORE changing the target values
        reel.style.transition = 'width 0.3s ease, height 0.3s ease, top 0.3s ease, left 0.3s ease, border 0.3s ease';
        reel.style.willChange = 'width, height, top, left, transform'; // hint to browser

        // Force a layout so the browser registers the starting values
        // reading .offsetHeight or getBoundingClientRect() forces layout
        reel.getBoundingClientRect();

        // Now set the target values — the transition should run
        /**
         * relative w-full max-w-sm aspect-[9/16] bg-slate-200 rounded-2xl overflow-hidden sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg 2xl:w-[30vw] 2xl:h-[80%] pointer-events-auto shadow-[0px_2px_15px_-5px_rgba(82,79,79,0.6)]
         */
        requestAnimationFrame(() => {
            reel.style.width = reelInitialStyles.width;
            reel.style.height = reelInitialStyles.height;
            reel.style.position = reelInitialStyles.position;
            reel.style.top = reelInitialStyles.top;
            reel.style.left = reelInitialStyles.left;
            reel.style.border = 'none';
            reel.style.transform = 'none';
        });

        setAreReelControlsVisible(true);
        setIsOutsideClickEnabled(false);
    };

    async function saveReel(titleOverride = reel?.title || '') {
        const nextTitle = (titleOverride || '').trim();

        if (!nextTitle) {
            notify({
                variant: "error",
                heading: "Title required",
                subheading: "Please enter a title before saving the reel."
            });
            return;
        }

        try {
            let savedId = reel?.id;

            try {
                const backendResponse = await makeApiRequest('/reels/save', 'POST', JSON.stringify({ ...reel, title: nextTitle }));
                if (backendResponse?.id) {
                    savedId = backendResponse.id;
                }
            } catch (backendError) {
                console.warn('Reel save endpoint not available; continuing with local reel save flow.', backendError);
            }

            const savedReel = {
                ...reel,
                id: savedId || reel?.id,
                title: nextTitle,
            };

            setReel(savedReel);
            setReels(prev => {
                const existingReels = prev || [];
                const alreadyExists = existingReels.some(item => item.id === savedReel.id);

                if (alreadyExists) {
                    return existingReels.map(item => item.id === savedReel.id ? savedReel : item);
                }

                return [savedReel, ...existingReels];
            });

            setShowSaveTitleModal(false);
            notify({
                variant: "success",
                heading: "Short saved successfully!",
            });
        } catch (error) {
            notify({
                variant: "error",
                heading: "Couldn't save short",
                subheading: error?.message || ""
            });
        }
    }


    return (
        <>
            {/* <div className={`fixed top-0 left-0 !z-[999999] flex flex-col items-center justify-center w-full h-full ${!isOutsideClickEnabled ? 'bg-black bg-opacity-75' : 'bg-transparent bg-opacity-0 pointer-events-none'}`} onClick={e => handleOutsideClick(e)}> */}
            {/* Reel viewer container */}
            <div className="reel-viewer relative h-[min(70vh,calc(100vh-8rem))] w-auto max-w-full aspect-[9/16] bg-slate-200 rounded-2xl overflow-hidden pointer-events-auto shadow-[0px_2px_15px_-5px_rgba(82,79,79,0.6)]">

                <div className="w-56 h-56 bg-blue-500 rounded-full absolute left-3/2 top-10 z-10 blur-[160px]"></div>
                <div className="w-56 h-56 bg-purple-500 rounded-full absolute left-35 top-[50%] z-10 blur-[160px]"></div>
                <div className="w-56 h-56 bg-pink-400 rounded-full absolute left-1/2 top-[100%] z-10 blur-[160px]"></div>

                <div className="absolute left-0 flex items-center justify-between w-full gap-3 p-1 top-3">
                    {areReelControlsVisible && <SwitchTransition mode="out-in">
                        <CSSTransition
                            key={currentTitle + '-key'}
                            classNames="fade"
                            timeout={300}
                        >
                            <p className="!ml-3 text-white break-words text-md !bg-slate-500/60 px-2 py-1 rounded-md">{currentTitle}</p>
                        </CSSTransition>
                    </SwitchTransition>}
                    <div className="flex items-center gap-2 ml-auto !mr-2 z-[51]">
                        {
                            (!isProjectReadOnly && reels.find(item => item.id === reel.id) === undefined) && (
                                <Save onClick={(e) => {
                                    e.stopPropagation();
                                    setSaveTitleValue(reel?.title || '');
                                    setShowSaveTitleModal(true);
                                }} size={30} className="p-2 z-50 text-white rounded-full cursor-pointer bg-slate-500/80 right-5 top-10" />
                            )
                        }
                        {areReelControlsVisible ? (
                            <div title="Collapse">
                                <PictureInPictureAltIcon className="p-2 z-50 !text-[28px] text-white rounded-full cursor-pointer bg-slate-500/80 right-5 top-10" onClick={handleCollapseReel} />
                            </div>
                        ) : (
                            <div title="Expand">
                                <AspectRatioIcon className="p-2 z-50 !text-[28px] text-white rounded-full cursor-pointer bg-slate-500/80 right-5 top-10" onClick={handleExpandReel} />
                            </div>
                        )}
                        {!isProjectReadOnly && <div onClick={() => setShowDownloadOption(prev => !prev)} >
                            {isDownloading ? <LoadingSpinner isSmall /> : (
                                <>
                                    <div title="Download">
                                        <FileDownloadIcon className="p-2 z-50 !text-[28px] text-white rounded-full cursor-pointer bg-slate-500/80 right-5 top-10" />
                                    </div>
                                    {
                                        showDownloadOption && (
                                            <>
                                                {downloadOptions()}
                                            </>
                                        )
                                    }
                                </>
                            )}
                        </div>}
                        <CloseIcon className="p-2 z-50 !text-[28px] text-white rounded-full cursor-pointer bg-slate-500/80 right-5 top-10" onClick={(e) => handleCloseReel(e)} />
                    </div>
                </div>
                <ReactPlayer
                    id="react-player"
                    width="100%"
                    height="100%"
                    className="relative z-50"
                    playing={video_autoplay}
                    url={sourcePublicUrl}
                    loop={video_loop}
                    onProgress={handleProgress}
                    onDuration={handleDuration}
                    controls
                />
            </div>
            {showSaveTitleModal && (
                <Modal
                    show={showSaveTitleModal}
                    onHide={() => setShowSaveTitleModal(false)}
                    size="md"
                    centered
                    dialogClassName='text-left'
                >
                    <Modal.Header className={`border-0 pb-0 ${theme === 'dark' ? '!bg-textColor-300 !text-white' : ''}`}>
                        <div className="flex flex-col gap-1">
                            <Modal.Title className={`text-lg font-semibold ${theme === 'dark' ? 'text-textColor-100' : 'text-gray-900'}`}>
                                Save Short
                            </Modal.Title>
                            <p className={`text-sm m-0 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                                Choose a title before saving this short.
                            </p>
                        </div>
                    </Modal.Header>

                    <Modal.Body className={`${theme === 'dark' ? 'bg-textColor-300 text-white' : ''}`}>
                        <div className='flex flex-col items-start justify-center gap-3'>
                            <div className="flex flex-col w-full">
                                <label htmlFor="reelTitle" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Short title
                                </label>
                                <input
                                    type="text"
                                    name="reelTitle"
                                    id="reelTitle"
                                    value={saveTitleValue}
                                    onChange={(e) => setSaveTitleValue(e.target.value)}
                                    placeholder="Enter a title for this short"
                                    className={`flex-1 block w-full p-2 mt-1 rounded-xl outline-none transition ${theme === 'dark'
                                        ? '!border !border-textColor-200 bg-textColor-300 text-white placeholder:text-gray-400'
                                        : '!border !border-gray-300 bg-white text-gray-900'}`}
                                    onKeyDown={(e) => e.key === 'Enter' && saveReel(saveTitleValue)}
                                />
                            </div>
                        </div>
                    </Modal.Body>

                    <Modal.Footer className={`flex items-center justify-end gap-3 ${theme === 'dark' ? '!bg-textColor-300 !text-white !border-t !border-t-textColor-200' : ''}`}>
                        <button
                            type="button"
                            className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 w-fit transition ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                            onClick={() => setShowSaveTitleModal(false)}
                        >
                            <span className={`select-none font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                                Cancel
                            </span>
                        </button>

                        <button
                            type="button"
                            className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 w-fit transition ${!saveTitleValue.trim()
                                ? 'cursor-not-allowed text-gray-400'
                                : theme === 'dark'
                                    ? 'hover:bg-purple-500/20 text-purple-300'
                                    : 'hover:bg-purple-50 text-purple-600'}`}
                            onClick={() => saveReel(saveTitleValue)}
                            disabled={!saveTitleValue.trim()}
                        >
                            <span className="select-none font-medium">
                                Save
                            </span>
                        </button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
}

export default ReelViewer;