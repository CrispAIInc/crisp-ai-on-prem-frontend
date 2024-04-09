const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

function StagedVideoThumbnail({ item }) {
    return (
        <img className="w-4/5 h-28 2xl:w-full 2xl:h-full" src={`${API_ENDPOINT}/thumbnails/${encodeURIComponent(item.category[0])}/${encodeURIComponent(item.thumbnail)}`}
            alt="Video Thumbnail" />
    );
}

export default StagedVideoThumbnail;