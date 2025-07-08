import ReactPlayer from "react-player";
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteIcon from "@mui/icons-material/Delete";
import toast from 'react-simple-toasts';
import { useContext, useState } from 'react';
import { ThemeContext } from '@emotion/react';
import makeApiRequest from '../../api';
import LoadingSpinner from "../LoadingSpinner";

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
            const encodedUrl = encodeURI(reel.reel_video_url);
            const response = await fetch(encodedUrl, { mode: 'cors' });
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = reel?.title + '.mp4'; // You can customize this filename
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

    const [duration, setDuration] = useState(0);

    const handleDuration = (dur) => {
        console.log('Full duration:', dur);
        setDuration(dur);
    };
    const handleProgress = (progress) => {
        const currentTime = progress.playedSeconds;

        // Find the latest segment whose start_time is <= currentTime
        const currentSegment = [{ start_time: "00:00:00", title: "Introduction" }, ...reel.segments, { start_time: `00:00:${duration - timeToSeconds(reel.segments[0].start_time)}`, title: "Conclusion" }]
            .reverse()
            .find(segment => currentTime >= timeToSeconds(segment.start_time));

        if (currentSegment && currentSegment.title !== currentTitle) {
            setCurrentTitle(currentSegment.title);
        }
    };

    return (
        <div className="fixed top-0 left-0 z-50 flex flex-col items-center justify-center w-full h-full bg-black bg-opacity-80">
            {/* Reel viewer container */}
            <div className="relative w-full h-full max-w-sm overflow-hidden rounded-2xl max-h-screen-md aspect-w-10 aspect-h-15 bg-slate-200 2xl:h-[80%] 2xl:w-[30vw]"> {/* Adjusted dimensions */}
                <div className="absolute left-0 flex items-center justify-between w-full gap-3 p-1 top-8">
                    <p className="!ml-3 truncate  text-white break-all text-md !bg-slate-500/60 px-2 py-1 rounded-md">{currentTitle}</p>
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