import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import AccessTimeIcon from '@mui/icons-material/AccessTime';

function HorizontalCard({ item, workspaceContainer }) {

    const { setCurrentResource, theme } = useContext(MainContext);

    const renderTooltip = (props, content) => (
        <Tooltip className='h-auto truncate tooltip' {...props}>{content}</Tooltip>
    );

    return (
        <div key={item.id} className={`relative grid grid-cols-[30%,1fr] gap-3 p-3 bg-background rounded-md shadow-sm sm:w-2/3 md:w-[40%] mb-4`}>
            {/* item thumbnail */}
            <div className="w-full rounded-md min-w-2/6">
                <img src={item.thumbnail} alt="chapter" className="object-cover w-full h-full rounded-md" />
            </div>
            {/* item content */}
            <div>
                <div className='flex items-center gap-1 mb-0 cursor-pointer select-none text-primary-300 w-fit' onClick={() => {

                    setCurrentResource(prev => ({ ...prev, timestamp: item.timestamp[0] }));
                    workspaceContainer.current.scrollTo({
                        top: 0,
                        behavior: "smooth",
                    });
                }}>
                    <AccessTimeIcon style={{ fontSize: "15px", fontWeight: "semibold" }} />
                    <span className="text-sm font-semibold tracking-wider">{item.timestamp[0]} - {item.timestamp[1]}</span>
                </div>
                <OverlayTrigger className='tooltip' placement="right" overlay={(props) => renderTooltip(props, item.title)}>
                    <h5 className={`mb-0 text-sm font-semibold line-clamp-2 w-fit ${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'}`}>{item.title}</h5>
                </OverlayTrigger>
            </div>
        </div>
    );
}

export default HorizontalCard;