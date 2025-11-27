import ReactPlayer from "react-player";
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import InfoIcon from '@mui/icons-material/Info';
import useFirebase from '../../hooks/useFirebase.js';
import toast from 'react-simple-toasts';
import { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '@emotion/react';
import { timeToSeconds } from "../../utils.js";
import LoadingSpinner from "../LoadingSpinner";
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import './fade.css';
import useResources from '../../hooks/useResources';
import { SettingsContext } from '../../contexts/settingsContext.jsx';
import { Drawer } from '@mui/material';
import ReelProps from '../ReelProps/index.jsx';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

function ReelViewer({
    closeReel,
    reel,
    setReels }) {

    const { theme } = useContext(ThemeContext);
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

    const handleDownloadReel = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        try {
            setIsDownloading(true);
            const downloadableUrl = await getDownloadableUrl(reel?.reel_video_url);
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
            a.download = `${reel.title || 'reel'}.mp4`;
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

    const handleOutsideClick = (e) => {
        if (e.target === e.currentTarget) {
            closeReel();
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

    return (
        <div className="fixed top-0 left-0 !z-50 flex flex-col items-center justify-center w-full h-full bg-black bg-opacity-75" onClick={(e) => handleOutsideClick(e)}>
            {/* Reel viewer container */}
            <div className="relative w-full max-w-sm aspect-[9/16] bg-slate-200 rounded-2xl overflow-hidden sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg 2xl:w-[30vw] 2xl:h-[80%]">

                <div className="w-56 h-56 bg-blue-500 rounded-full absolute left-3/2 top-10 z-10 blur-[160px]"></div>
                <div className="w-56 h-56 bg-purple-500 rounded-full absolute left-35 top-[50%] z-10 blur-[160px]"></div>
                <div className="w-56 h-56 bg-pink-400 rounded-full absolute left-1/2 top-[100%] z-10 blur-[160px]"></div>

                <div className="absolute left-0 flex items-center justify-between w-full gap-3 p-1 top-8">
                    <SwitchTransition mode="out-in">
                        <CSSTransition
                            key={currentTitle + '-key'}
                            classNames="fade"
                            timeout={300}
                        >
                            <p className="!ml-3 text-white break-words text-md !bg-slate-500/60 px-2 py-1 rounded-md">{currentTitle}</p>
                        </CSSTransition>
                    </SwitchTransition>
                    <div className="flex items-center gap-2 !mr-2">
                        {/* <div className="z-50 p-2 w-[30px] h-[30px] flex flex-col items-center justify-center rounded-full cursor-pointer bg-slate-500/80 right-5 top-10">
                            {isPending ? <LoadingSpinner isSmall /> : <DeleteIcon
                                onClick={(event) => handleRemoveReel(event)}
                                className="!text-[15px] w-full h-full text-white rounded-full" />}
                        </div> */}
                        <InfoIcon className="p-2 z-50 !text-[28px] text-white rounded-full cursor-pointer bg-slate-500/80 right-5 top-10" onClick={handleToggleReelProps} />
                        <span className="p-2 z-50 !text-[7px] text-white rounded-full cursor-pointer bg-slate-500/80 right-5 top-10">
                            {isDownloading ? <LoadingSpinner isSmall /> : <FileDownloadIcon onClick={(e) => handleDownloadReel(e)} />}
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
            <Drawer slotProps={{ backdrop: { invisible: true } }} anchor="right" variant="persistent" open={isReelPropsOpen} onClose={handleCloseReelProps}>
                <ReelProps reel={reel} closeReelProps={handleCloseReelProps} />
            </Drawer>
        </div >
    );
}

export default ReelViewer;