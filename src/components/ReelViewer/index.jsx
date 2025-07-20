import ReactPlayer from "react-player";
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteIcon from "@mui/icons-material/Delete";
import toast from 'react-simple-toasts';
import { useContext, useState } from 'react';
import { ThemeContext } from '@emotion/react';
import makeApiRequest from '../../api';
import LoadingSpinner from "../LoadingSpinner";
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import './fade.css';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
function ReelViewer({ closeReel, reel, setReels }) {

    const { theme } = useContext(ThemeContext);

    const [isPending, setIsPending] = useState(false);

    const handleCloseReel = (e) => {
        e.stopPropagation();
        closeReel();
    };

    const handleDownloadReel = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        try {
            const encodedUrl = encodeURI(`${API_ENDPOINT}${reel.reel_video_url}`);
            const response = await fetch(encodedUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'video/mp4',
                    'Accept': 'video/mp4',
                }
            });
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = (reel?.title || "reel") + '.mp4'; // You can customize this filename
            a.click();

            window.URL.revokeObjectURL(blobUrl);
            toast('Reel downloaded successfully!', { className: 'p-2 rounded-md bg-primary-200 text-white', theme });
        } catch (err) {
            console.error("Download failed", err);
            toast('Download failed. Please try again.', { className: 'p-2 rounded-md', theme });
        }
    };

    // const handleSaveReel = async (e) => {
    //     e.stopPropagation();
    //     e.preventDefault();

    //     try {
    //         console.log('saving reel...');
    //         setIsReelSaved(true);
    //     } catch (e) {
    //         toast(e?.response?.data || 'Something bad happened', { className: "p-2 rounded-md bg-primary-200 text-white", theme });
    //         setIsReelSaved(false);
    //     }

    //     toast('Reel Saved!', { className: "p-2 rounded-md bg-primary-200 text-white", theme });
    // };

    const handleRemoveReel = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsPending(true);

        try {
            await makeApiRequest('/remove-reel', 'POST', JSON.stringify({
                videoUrl: reel.reel_video_url
            }));
            toast('Reel deleted!', { className: "p-2 rounded-md bg-primary-200 text-white", theme });

            console.log("before");
            const data = await makeApiRequest("/reels", "get");
            setReels(data);
            console.log("after");
            closeReel();
        } catch (e) {
            toast(e?.response?.data || 'Something bad happened', { className: "p-2 rounded-md bg-primary-200 text-white", theme });
        } finally {
            setIsPending(false);
        }
    };

    function timeToSeconds(timeStr) {
        const parts = timeStr.split(':').map(Number);
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    // const segmentsWithSeconds = reel?.segments.map(seg => ({
    //     ...seg,
    //     startInSeconds: timeToSeconds(seg.start_time),
    // }));
    const [currentTitle, setCurrentTitle] = useState('');

    // const handleProgress = (progress) => {
    //     const currentTime = progress.playedSeconds;

    //     let titleToShow = 'Introduction'; // Default title

    //     for (let i = 0; i < segmentsWithSeconds.length; i++) {
    //         const currentSegment = segmentsWithSeconds[i];
    //         const nextSegment = segmentsWithSeconds[i + 1];

    //         if (currentTime >= currentSegment.startInSeconds &&
    //             (!nextSegment || currentTime < nextSegment.startInSeconds)) {
    //             titleToShow = currentSegment.title;
    //             break;
    //         }
    //     }

    //     // If it's after the last segment
    //     const lastSegment = segmentsWithSeconds[segmentsWithSeconds.length - 1];
    //     if (currentTime >= lastSegment.startInSeconds + 10) { // optional buffer
    //         titleToShow = 'Conclusion';
    //     }

    //     if (titleToShow !== currentTitle) {
    //         setCurrentTitle(titleToShow);
    //     }
    // };

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
                        <FileDownloadIcon className="p-2 z-50 !text-[28px] text-white rounded-full cursor-pointer bg-slate-500/80 right-5 top-10" onClick={(e) => handleDownloadReel(e)} />
                        <CloseIcon className="p-2 z-50 !text-[28px] text-white rounded-full cursor-pointer bg-slate-500/80 right-5 top-10" onClick={(e) => handleCloseReel(e)} />
                    </div>
                </div>
                <ReactPlayer
                    id="react-player"
                    width="100%"
                    height="100%"
                    playing={true}
                    url={API_ENDPOINT + reel.reel_video_url}
                    loop={true}
                    onProgress={handleProgress}
                    onDuration={handleDuration}
                    // onReady={() => setIsPlayerReady(true)}
                    // ref={player}
                    controls
                />
            </div>
        </div >
    );
}

export default ReelViewer;