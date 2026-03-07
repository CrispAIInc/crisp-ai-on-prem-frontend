import "./spinner.css";

export default function LoadingSpinner({ isSmall = false, videoSpinner = false, isDeleting = false, cssClasses = "" }) {
  return (
    // <div className={`spinner-container `}>
    //   {videoSpinner ? <div className={`video-spinner loading-spinner `}></div> : <div className={`loading-spinner ${isSmall ? '!w-5 !h-5' : '!w-12 !h-12'}`}></div>}
    // </div>

    <span className={`loader ${cssClasses}`}></span>
  );
}