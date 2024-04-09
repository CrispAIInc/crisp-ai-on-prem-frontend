const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

function StagedImageThumbnail({ item }) {
    return (
        <img className="w-4/5 h-28 2xl:w-full 2xl:h-full" src={`${API_ENDPOINT}/img-thumbnails/${encodeURIComponent(item.category[0])}/${encodeURIComponent(item.thumbnail)}`}
            alt="Image Thumbnail" />
    );
}

export default StagedImageThumbnail;