import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

function StagedVideoThumbnail({ item }) {

    const { theme } = useContext(MainContext);

    const renderTooltip = props => {
        if (item?.metadata?.summary?.content?.length > 0) {
            return <Tooltip className='h-auto truncate tooltip' {...props}>{item?.metadata?.summary?.content?.split(' ').slice(0, 30).join(' ')}...</Tooltip>;
        }
        return <></>;
    };

    return (
        <OverlayTrigger className='tooltip' placement="right" overlay={renderTooltip}>
            <div className="relative  h-24 !w-full">
                <img className="w-full h-24" src={`${API_ENDPOINT}/thumbnails/${encodeURIComponent(item.category[0])}/${encodeURIComponent(item.thumbnail)}`}
                    alt="Video Thumbnail" />

                {/* thumbnail bottom title */}
                <div className={`absolute bottom-0 left-0 flex items-center w-full h-8 gap-1 truncate ${theme === 'light' ? 'bg-white' : 'bg-[#333333]'}`}>
                    {/* <PlayCircleIcon fontSize="15" style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} /> */}
                    <p className={`${theme === "light" ? 'text-black' : 'text-white'} pl-1 text-sm truncate`}>{item.source_path}</p>
                </div>
            </div>
        </OverlayTrigger>
    );
}

export default StagedVideoThumbnail;


