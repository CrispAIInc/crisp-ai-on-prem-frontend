import ReactPlayer from "react-player";
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import InfoIcon from '@mui/icons-material/Info';
import useFirebase from '../../hooks/useFirebase.js';
import toast from 'react-simple-toasts';
import { useContext, useState, useEffect } from 'react';
import { timeToSeconds } from "../../utils.js";
import LoadingSpinner from "../LoadingSpinner";
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import './fade.css';
import useResources from '../../hooks/useResources';
import { SettingsContext } from '../../contexts/settingsContext.jsx';
import { Drawer } from '@mui/material';
import ReelProps from '../ReelProps/index.jsx';
import { MainContext } from '../../contexts/mainContext.jsx';
import Moveable from "react-moveable";
import PictureInPictureAltIcon from '@mui/icons-material/PictureInPictureAlt';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';

function ReelViewer({
    closeReel,
    reel,
    setReels }) {

    const { theme } = useContext(MainContext);
    const { getPublicUrl, getDownloadableUrl } = useFirebase();

    const { generalSettings: { video_autoplay, video_loop } } = useContext(SettingsContext);

    const { getReels } = useResources({ setReels });

    const [isDownloading, setIsDownloading] = useState(false);
    const [sourcePublicUrl, setSourcePublicUrl] = useState(null);
    // const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        if (reel?.reel_video_url) {
            getPublicUrl(reel?.reel_video_url)
                .then(setSourcePublicUrl)
                .catch(console.error);
        }
    }, [reel?.reel_video_url]);

    const handleCloseReel = (e) => {
        e.stopPropagation();
        closeReel();
    };

    const handleDownload = async (e, _url, urlFileExtension) => {
        e.stopPropagation();
        e.preventDefault();

        try {
            setIsDownloading(true);
            const downloadableUrl = await getDownloadableUrl(_url);
            console.log(downloadableUrl);

            const response = await fetch(downloadableUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const blob = await response.blob();
            console.log(blob);

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${reel.title || 'reel'}.${urlFileExtension || 'mp4'}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // toast('Reel downloaded successfully!', { className: 'p-2 rounded-md bg-primary-200 text-white', theme });
        } catch (err) {
            console.error("Download failed", err);
            toast('Download failed. Please try again.', { className: 'p-2 rounded-md', theme });
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

    const [duration, setDuration] = useState(0);

    const handleDuration = (dur) => {
        setDuration(dur);
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

    const MIN_W = 250;
    const MIN_H = 250;
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
        });

        setAreReelControlsVisible(true);
        setIsOutsideClickEnabled(false);
    };


    return (
        <>
            <div className={`fixed top-0 left-0 !z-[999999] flex flex-col items-center justify-center w-full h-full ${!isOutsideClickEnabled ? 'bg-black bg-opacity-75' : 'bg-transparent bg-opacity-0 pointer-events-none'}`} onClick={e => handleOutsideClick(e)}>
                {/* Reel viewer container */}
                <div className="reel-viewer relative w-full max-w-sm aspect-[9/16] bg-slate-200 rounded-2xl overflow-hidden sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg 2xl:w-[30vw] 2xl:h-[80%] pointer-events-auto shadow-[0px_2px_15px_-5px_rgba(82,79,79,0.6)]">

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
                            {/* <div className="z-50 p-2 w-[30px] h-[30px] flex flex-col items-center justify-center rounded-full cursor-pointer bg-slate-500/80 right-5 top-10">
                        {isPending ? <LoadingSpinner isSmall /> : <DeleteIcon
                            onClick={(event) => handleRemoveReel(event)}
                            className="!text-[15px] w-full h-full text-white rounded-full" />}
                    </div> */}
                            {areReelControlsVisible ? <PictureInPictureAltIcon className="p-2 z-50 !text-[28px] text-white rounded-full cursor-pointer bg-slate-500/80 right-5 top-10" onClick={handleCollapseReel} /> : <AspectRatioIcon className="p-2 z-50 !text-[28px] text-white rounded-full cursor-pointer bg-slate-500/80 right-5 top-10" onClick={handleExpandReel} />}
                            <InfoIcon className="p-2 z-50 !text-[28px] text-white rounded-full cursor-pointer bg-slate-500/80 right-5 top-10" onClick={handleToggleReelProps} />
                            <span className="p-2 z-50 !text-[7px] relative text-white rounded-full cursor-pointer bg-slate-500/80" onClick={() => setShowDownloadOption(prev => !prev)} >
                                {isDownloading ? <LoadingSpinner isSmall /> : (
                                    <>
                                        <FileDownloadIcon />
                                        {
                                            showDownloadOption && (
                                                // <div onClick={(e) => e.stopPropagation()}>
                                                <>
                                                    {downloadOptions()}
                                                </>
                                                // </div>
                                            )
                                        }
                                    </>
                                )}
                            </span>
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
                        // onReady={() => setIsPlayerReady(true)}
                        // ref={player}
                        controls
                    />
                </div>

                {/* reel properties side drawer */}
                <Drawer className='pointer-events-auto' slotProps={{ backdrop: { invisible: true } }} anchor="right" variant="persistent" open={isReelPropsOpen} onClose={handleCloseReelProps}>
                    <ReelProps reel={reel} closeReelProps={handleCloseReelProps} />
                </Drawer>
            </div>
            <Moveable
                target={document.querySelector(".reel-viewer")}
                container={null}
                origin={true}

                /* Resize event edges */
                edge={true}

                /* draggable */
                draggable={!areReelControlsVisible}
                throttleDrag={0}
                onDrag={({
                    target,
                    beforeDelta, beforeDist,
                    left, top,
                    right, bottom,
                    delta, dist,
                    transform,
                    clientX, clientY,
                }) => {
                    console.log("onDrag left, top", left, top);
                    // target!.style.left = `${left}px`;
                    // target!.style.top = `${top}px`;
                    console.log("onDrag translate", dist);
                    target.style.transform = transform;
                }}

                /* When resize or scale, keeps a ratio of the width, height. */
                keepRatio={true}

                /* resizable*/
                /* Only one of resizable, scalable, warpable can be used. */
                resizable={false}
                throttleResize={0}
                onResize={({ target, width, height, drag }) => {
                    // Clamp width/height to min/max values
                    // const newWidth = Math.min(Math.max(width, MIN_W), MAX_W);
                    // const newHeight = Math.min(Math.max(height, MIN_H), MAX_H);

                    // Show or hide reel controls based on size
                    // if (newWidth <= 350 || newHeight <= 350) {
                    //     setAreReelControlsVisible(false);
                    // } else {
                    //     setAreReelControlsVisible(true);
                    // }

                    // Apply size to target
                    // const el = target.current;
                    target.style.width = `${width}px`;
                    target.style.height = `${height}px`;
                }}
            />
        </>
    );
}

export default ReelViewer;