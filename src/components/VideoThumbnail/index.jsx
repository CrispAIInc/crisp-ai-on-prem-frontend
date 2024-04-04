import React, { useState } from 'react';
import './thumbnail.css';
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

function VideoThumbnail({ item }) {
  const renderTooltip = props => (
    <Tooltip className='tooltip' {...props}>{item.source_path}</Tooltip>
  );

  return (
    <OverlayTrigger className='tooltip' placement="right" overlay={renderTooltip}>
      <img className="w-full h-24" src={`${API_ENDPOINT}/thumbnails/${encodeURIComponent(item.category[0])}/${encodeURIComponent(item.thumbnail)}`}
        alt="Video Thumbnail" />
    </OverlayTrigger>
  );
}

export default VideoThumbnail;