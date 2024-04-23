import LoadingSpinner from "../LoadingSpinner";
import { Checkbox } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VideoThumbnail from "../VideoThumbnail";
import PDFThumbnail from "../PDFThumbnail";
import ImageThumbnail from "../ImageThumbnail";
import StagedImageThumbnail from '../StagedImageThumbnail';
import StagedVideoThumbnail from '../StagedVideoThumbnail';
import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

const ContentPanelThumbnail = ({
  isDeleting,
  clickedIndex,
  index,
  item,
  handleCheckboxChange,
  onThumbnailClick,
  deleteResource,
}) => {

  const { theme } = useContext(MainContext);

  return (
    <div className={`relative pt-4 rounded-md cursor-pointer ${theme === "dark" ? "!border !border-textColor-300" : '!border !border-textColor-100'} 2xl:w-44 2xl:h-2/3`} onClick={(event) => onThumbnailClick(event, item)}>
      <>
        {isDeleting && clickedIndex === index ? (
          <div className="thumbnail-loader">
            <LoadingSpinner />
          </div>
        ) : null}
        <Checkbox
          className="!absolute top-0 -left-1 p-0 !ml-1"
          checked={item.is_selected}
          onChange={() => handleCheckboxChange(item)}
          onClick={(event) => event.stopPropagation()}
          inputProps={{ "aria-label": "Select source" }}
        />
        {item.file_type === "video" && <StagedVideoThumbnail item={item} />}
        {item.file_type === "pdf" && <PDFThumbnail item={item} />}
        {item.file_type === "img" && <StagedImageThumbnail item={item} />}
        <DeleteIcon
          onClick={(event) => { event.stopPropagation(); deleteResource(event, index); }}
          color="error"
          className="absolute cursor-pointer !top-0 !left-[calc(100%-24px)] mr-1"
        />
      </>
    </div>
  );
};

export default ContentPanelThumbnail;;
