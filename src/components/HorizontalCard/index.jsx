import { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext.jsx';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PreviewModal from '../PreviewModal';
import GsFile from '../GsFile/index.jsx';

function HorizontalCard({ item, workspaceContainer }) {

    const { setCurrentResource, theme, setJumpToPage, contentPanelContainerRef } = useContext(MainContext);
    const [isLightboxOpen, setLightboxOpen] = useState(false);

    function closeLightbox() {
        setLightboxOpen(false);
    }

    const thumbnail = import.meta.env.VITE_API_ENDPOINT + (item.keyframe_url ?? item.thumbnail_url);

    return (
        <div key={item.id} className={`relative grid grid-cols-[64px_1fr] gap-3 p-3 bg-background rounded-md shadow-sm mb-4`}>
            {/* item thumbnail */}
            <div className="relative w-20 h-20 rounded-md cursor-pointer " onClick={() => setLightboxOpen(true)}>
                <GsFile src={item.keyframe_url ?? item.thumbnail_url} alt="chapter" className="object-cover w-full h-full rounded-md lg:max-w-full" />
            </div>
            {isLightboxOpen && (
                <PreviewModal closeLightbox={closeLightbox} content={item.keyframe_url ?? item.thumbnail_url} classNames={`h-full ${item.keyframe_url ? '!w-[55vw] !h-[65vh]' : '!w-1/3 !h-full'}`} />
            )}
            {/* item content */}
            <div className="flex flex-col gap-1 select-text">
                {
                    item.timestamp ? <div className='flex items-center gap-1 mb-0 cursor-pointer select-none text-primary-300 w-fit' onClick={() => {

                        setCurrentResource(prev => ({ ...prev, timestamp: item.timestamp[0] }));
                        contentPanelContainerRef.current.scrollTo({
                            top: 0,
                            behavior: "smooth",
                        });
                    }}>
                        <AccessTimeIcon style={{ fontSize: "15px", fontWeight: "semibold" }} />
                        <span className="text-sm font-semibold tracking-wider">{item.timestamp[0]} - {item.timestamp[1]}</span>
                    </div> : <div className='flex items-center gap-2 mb-0 text-[9px] cursor-pointer font-bold text-primary-300 w-fit' onClick={() => {

                        setJumpToPage({ page: parseInt(item.page) });
                        contentPanelContainerRef.current.scrollTo({
                            top: 0,
                            behavior: "smooth", // Enables smooth scrolling
                        });
                    }}>
                        <MenuBookIcon /> <span className="text-md">{item.page}</span>
                    </div>
                }
                <h5 className={`text-[13px] mb-1 font-semibold line-clamp-2 w-fit ${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'}`}>{item.title}</h5>
                {/* <OverlayTrigger className='tooltip' placement="right" overlay={(props) => renderTooltip(props, item.content)}> */}
                <p className="text-[14px] text-gray-600">{item.content}</p>
                {/* </OverlayTrigger> */}
            </div >
        </div >
    );
}

export default HorizontalCard;