import "./spinner.css";

export default function LoadingSpinner({ isSmall = false, videoSpinner = false, isDeleting = false }) {
  return (
    <div className={`spinner-container `}>
      {videoSpinner ? <div className={`video-spinner loading-spinner !border !border-gray-200 !border-t-4 ${isDeleting ? '!border-t-red-400' : '!border-t-indigo-600'}`}></div> : <div className={`loading-spinner ${isSmall ? '!w-5 !h-5' : '!w-12 !h-12'}`}></div>}
    </div>
  );
}