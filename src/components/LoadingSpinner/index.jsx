import "./spinner.css";

export default function LoadingSpinner(props) {
  return (
    <div className="spinner-container">
      {props.videoSpinner ? <div className="video-spinner loading-spinner"></div> : <div className="loading-spinner"></div>}
    </div>
  );
}