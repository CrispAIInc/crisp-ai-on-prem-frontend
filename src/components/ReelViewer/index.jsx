import ReactPlayer from "react-player";
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import toast from 'react-simple-toasts';
import { useContext } from 'react';
import { ThemeContext } from '@emotion/react';

function ReelViewer({ closeReel, videoUrl, videoTitle = "" }) {

    const { theme } = useContext(ThemeContext);

    const handleCloseReel = (e) => {
        e.stopPropagation();
        closeReel();
    };

    const handleDownloadReel = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        try {
            const response = await fetch(videoUrl, { mode: 'cors' });
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = 'reel.mp4'; // You can customize this filename
            a.click();

            window.URL.revokeObjectURL(blobUrl);
            toast('Reel downloaded successfully!', { className: 'p-2 rounded-md bg-primary-200 text-white', theme });
        } catch (err) {
            console.error("Download failed", err);
            toast('Download failed. Please try again.', { className: 'p-2 rounded-md', theme });
        }
    };

    return (
        <div className="fixed top-0 left-0 z-50 flex flex-col items-center justify-center w-full h-full bg-black bg-opacity-75">
            {/* Reel viewer container */}
            <div className="relative w-full h-full max-w-sm overflow-hidden rounded-2xl max-h-screen-md aspect-w-10 aspect-h-15"> {/* Adjusted dimensions */}
                <div className="absolute left-0 flex items-center justify-between w-full gap-3 p-1 top-8">
                    <p className="!ml-3 truncate  text-white break-all text-md">{videoTitle}</p>
                    <div className="flex items-center gap-2 !mr-2">
                        <FileDownloadIcon className="p-2 z-50 !text-[30px] text-white rounded-full cursor-pointer bg-slate-500 right-5 top-10" onClick={(e) => handleDownloadReel(e)} />
                        <CloseIcon className="p-2 z-50 !text-[30px] text-white rounded-full cursor-pointer bg-slate-500 right-5 top-10" onClick={(e) => handleCloseReel(e)} />
                    </div>
                </div>
                <ReactPlayer
                    id="react-player"
                    width="100%"
                    height="100%"
                    playing={true}
                    url={videoUrl}
                    loop={true}
                    // onReady={() => setIsPlayerReady(true)}
                    // ref={player}
                    controls
                />
            </div>
        </div>
    );
}

export default ReelViewer;