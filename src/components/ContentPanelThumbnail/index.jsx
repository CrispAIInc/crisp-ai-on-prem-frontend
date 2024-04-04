import LoadingSpinner from "../LoadingSpinner";
import { Checkbox } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VideoThumbnail from "../VideoThumbnail";
import PDFThumbnail from "../PDFThumbnail";
import ImageThumbnail from "../ImageThumbnail";
import StagedImageThumbnail from '../StagedImageThumbnail';
import StagedVideoThumbnail from '../StagedVideoThumbnail';

const ContentPanelThumbnail = ({
  isDeleting,
  clickedIndex,
  index,
  item,
  handleCheckboxChange,
  onThumbnailClick,
  deleteResource,
}) => {
  return (
    <div className="cursor-pointer 2xl:w-44 2xl:h-2/3" onClick={(event) => onThumbnailClick(event, item)}>
      <div>
        {isDeleting && clickedIndex === index ? (
          <div className="thumbnail-loader">
            <LoadingSpinner />
          </div>
        ) : null}
        <div

          className="relative"
        >
          <Checkbox
            className="!absolute top-0 -left-1"
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
            className="absolute cursor-pointer left-1 bottom-1"
          />
        </div>
      </div>
      <span className="text-xs leading-none break-words text-textColor-200">
        {item.source_path}
      </span>
    </div>
  );
};

export default ContentPanelThumbnail;
