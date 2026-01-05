import './pdf_thumbnail.css';
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext.jsx';
import GsFile from '../GsFile';

function PDFThumbnail({ item }) {

  const { theme } = useContext(MainContext);

  const renderTooltip = props => {
    if (item?.metadata?.summary?.content?.length > 0) {
      return <Tooltip className='truncate h-80 tooltip' {...props}>{item?.metadata?.summary?.content?.split(' ').slice(0, 30).join(' ')}...</Tooltip>;
    }
    return <></>;
  };

  return (
    <OverlayTrigger className='tooltip' placement="right" overlay={renderTooltip}>
      <div className="relative  h-24 !w-full">
        <GsFile className="w-full h-full" gsUrl={item.thumbnail} alt="PDF Thumbnail" />

        {/* thumbnail bottom title */}
        <div className={`absolute bottom-0 left-0 flex items-center w-full h-8 gap-1 truncate ${theme === 'light' ? 'bg-white' : 'bg-[#333333]'}`}>
          <p className={`${theme === "light" ? 'text-black' : 'text-white'} pl-1 text-xs truncate`}>{item.source_path}</p>
        </div>
      </div>
    </OverlayTrigger>
  );
}

export default PDFThumbnail;