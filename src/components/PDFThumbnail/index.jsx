import React, { useState } from 'react';
import './pdf_thumbnail.css';
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

function PDFThumbnail({ item }) {
  const renderTooltip = props => (
    <Tooltip className='tooltip' {...props}>{item.source_path}</Tooltip>
  );

  return (
    <OverlayTrigger className='tooltip' placement="right" overlay={renderTooltip}>
      <img className="w-4/5 pdf-thumbnail-img" src={`${API_ENDPOINT}/pdf-thumbnails/${encodeURIComponent(item.category[0])}/${encodeURIComponent(item.thumbnail)}`}
        alt="PDF Thumbnail" />
    </OverlayTrigger>
  );
}

export default PDFThumbnail;