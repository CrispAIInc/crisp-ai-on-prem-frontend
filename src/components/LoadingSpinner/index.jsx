import "./spinner.css";

export default function LoadingSpinner(props) {
  return (
    <div className={`spinner-container`}>
      {props.videoSpinner ? <div className="video-spinner loading-spinner"></div> : <div className={`loading-spinner ${props.isSmall ? '!w-5 !h-5' : '!w-12 !h-12'}`}></div>}
    </div>
  );
}