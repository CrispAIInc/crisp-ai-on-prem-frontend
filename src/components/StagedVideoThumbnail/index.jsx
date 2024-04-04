import React, { useState } from 'react';
// import './thumbnail.css';
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

function StagedVideoThumbnail({ item }) {
    const renderTooltip = props => (
        <Tooltip className='tooltip' {...props}>{item.summary}</Tooltip>
    );

    return (
        <img className="w-4/5 h-28 2xl:w-full 2xl:h-full" src={`${API_ENDPOINT}/thumbnails/${encodeURIComponent(item.category[0])}/${encodeURIComponent(item.thumbnail)}`}
            alt="Video Thumbnail" />
        // <OverlayTrigger className='tooltip' placement="right" overlay={renderTooltip}>
        // </OverlayTrigger>
    );
}

export default StagedVideoThumbnail;