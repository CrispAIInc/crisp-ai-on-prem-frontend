import LoadingSpinner from "../LoadingSpinner";
import { Checkbox } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PDFThumbnail from "../PDFThumbnail";
import StagedImageThumbnail from '../StagedImageThumbnail';
import StagedVideoThumbnail from '../StagedVideoThumbnail';
import ImageIcon from '@mui/icons-material/Image';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

const ContentPanelThumbnail = ({
  isDeleting,
  clickedIndex,
  item,
  handleCheckboxChange,
  onThumbnailClick,
  deleteResource,
}) => {

  const { theme } = useContext(MainContext);

  return (
    <div className={`relative rounded-md cursor-pointer ${theme === "dark" ? "!border !border-textColor-300" : '!border !border-textColor-100'} !w-28 h-auto`} onClick={(event) => onThumbnailClick(event, item)}>
      <>
        {(isDeleting && clickedIndex?.source_path === item?.source_path) && (
          <div className="thumbnail-loader absolute left-1/2 top-1/2 z-[2] translate-x-[-50%] translate-y-[-50%] transform">
            <LoadingSpinner />
          </div>
        )}

        <div className="flex items-center justify-between">
          <Checkbox
            className="p-0 !ml-1"
            checked={item.is_selected}
            onChange={(e) => handleCheckboxChange(e?.target?.checked, item)}
            onClick={(event) => event.stopPropagation()}
            inputProps={{ "aria-label": "Select source" }}
          />

          {
            item.file_type === "video" ? (
              <PlayCircleIcon style={{ fontSize: "20px", color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
            ) : item.file_type === "pdf" ? (
              <InsertDriveFileIcon style={{ fontSize: "20px", color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
            ) : item.file_type === "img" ? (
              <ImageIcon style={{ fontSize: "20px", color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
            ) : null
          }

          <DeleteIcon
            onClick={(event) => { event.stopPropagation(); deleteResource(event, [item]); }}
            style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }}
            className="cursor-pointermr-1"
          />
        </div>
        {item.file_type === "video" && <StagedVideoThumbnail item={item} />}
        {item.file_type === "pdf" && <PDFThumbnail item={item} />}
        {item.file_type === "img" && <StagedImageThumbnail item={item} />}
      </>
    </div>
  );
};

export default ContentPanelThumbnail;
