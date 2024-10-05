import './pdf_thumbnail.css';
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

function PDFThumbnail({ item }) {

  const { theme } = useContext(MainContext);

  const renderTooltip = props => (
    <Tooltip className='tooltip' {...props}>{item.source_path}</Tooltip>
  );

  return (
    <OverlayTrigger className='tooltip' placement="right" overlay={renderTooltip}>
      <div className="relative w-36 h-28">
        <img className="w-full h-full" src={`${API_ENDPOINT}/pdf-thumbnails/${encodeURIComponent(item.category[0])}/${encodeURIComponent(item.thumbnail)}`}
          alt="PDF Thumbnail" />

        {/* thumbnail bottom title */}
        <div className={`absolute bottom-0 left-0 flex items-center w-full h-10 gap-2 p-2 truncate ${theme === 'light' ? 'bg-white' : 'bg-[#333333]'}`}>
          <InsertDriveFileIcon />
          <p className={`${theme === "light" ? 'text-black' : 'text-white'} text-sm truncate`}>{item.source_path}</p>
        </div>
      </div>
    </OverlayTrigger>
  );
}

export default PDFThumbnail;