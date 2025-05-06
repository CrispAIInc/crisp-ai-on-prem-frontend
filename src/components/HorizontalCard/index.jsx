import { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PreviewModal from '../PreviewModal';

function HorizontalCard({ item, workspaceContainer }) {

    const { setCurrentResource, theme, setJumpToPage } = useContext(MainContext);
    const [isLightboxOpen, setLightboxOpen] = useState(false);

    function closeLightbox() {
        setLightboxOpen(false);
    }

    const thumbnail = import.meta.env.VITE_API_ENDPOINT + (item.keyframe_url ?? item.thumbnail_url);

    return (
        <div key={item.id} className={`relative grid grid-cols-[64px_1fr] gap-3 p-3 bg-background rounded-md shadow-sm mb-4`}>
            {/* item thumbnail */}
            <div className="relative w-20 h-20 bg-red-600 rounded-md cursor-pointer " onClick={() => setLightboxOpen(true)}>
                <img src={thumbnail} alt="chapter" className="object-cover w-full h-full rounded-md lg:max-w-full" />
            </div>
            {isLightboxOpen && (
                <PreviewModal closeLightbox={closeLightbox} content={thumbnail} classNames={`h-full ${item.keyframe_url ? '!w-[55vw] !h-[65vh]' : '!w-1/3 !h-full'}`} />
            )}
            {/* item content */}
            <div className="flex flex-col gap-1 select-text">
                {
                    item.timestamp ? <div className='flex items-center gap-1 mb-0 cursor-pointer select-none text-primary-300 w-fit' onClick={() => {

                        setCurrentResource(prev => ({ ...prev, timestamp: item.timestamp[0] }));
                        workspaceContainer.current.scrollTo({
                            top: 0,
                            behavior: "smooth",
                        });
                    }}>
                        <AccessTimeIcon style={{ fontSize: "15px", fontWeight: "semibold" }} />
                        <span className="text-sm font-semibold tracking-wider">{item.timestamp[0]} - {item.timestamp[1]}</span>
                    </div> : <div className='flex items-center gap-2 mb-0 text-[9px] cursor-pointer font-bold text-primary-300 w-fit' onClick={() => {

                        setJumpToPage({ page: parseInt(item.page) });
                        workspaceContainer.current.scrollTo({
                            top: 0,
                            behavior: "smooth", // Enables smooth scrolling
                        });
                    }}>
                        <MenuBookIcon /> <span className="text-md">{item.page}</span>
                    </div>
                }
                <h5 className={`text-[13px] mb-1 font-semibold line-clamp-2 w-fit ${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'}`}>{item.title}</h5>
                {/* <OverlayTrigger className='tooltip' placement="right" overlay={(props) => renderTooltip(props, item.description)}> */}
                <p className="text-[14px] text-gray-600">{item.description}</p>
                {/* </OverlayTrigger> */}
            </div >
        </div >
    );
}

export default HorizontalCard;