import React, { useState, useEffect, useContext } from 'react';
// import './metadata_panel.css';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import NoData from "../NoData";
import { MainContext } from "../../contexts/mainContext.js";


const MetadataPanel = () => {

    const { currentResource } = useContext(MainContext);

    return (
        <div className='metadata-wrapper px-2'>
            {
                currentResource
                    ?
                    (
                        currentResource.file_type != 'img' ?
                            (<div className='metadata-container'>
                                <h3 className="mt-4 text-md text-textColor-300 font-semiBold">Summary</h3>
                                <p className="text-sm text-textColor-300">{currentResource.summary}</p>

                                <h3 className="mt-4 text-md text-textColor-300 font-semiBold">Topic by Topic Summary</h3>
                                <p className="text-sm text-textColor-300">{currentResource.topic_summaries}</p>

                                <h3 className="mt-4 text-md text-textColor-300 font-semiBold">{currentResource.file_type == 'video' ? 'Video Transcript' : 'PDF Transcript'}</h3>
                                <p className="text-sm text-textColor-300">{currentResource.transcript}</p>

                                <h3 className="mt-4 text-md text-textColor-300 font-semiBold">Key Topics</h3>
                                <p className="text-sm text-textColor-300">{currentResource.keywords}</p>
                            </div>)
                            :
                            (<div className='metadata-container'>
                                <h3 className="mt-4 text-md text-textColor-300 font-semiBold">Caption</h3>
                                <p className="text-sm text-textColor-300">{currentResource.caption}</p>

                                <h3 className="mt-4 text-md text-textColor-300 font-semiBold">Key Topics</h3>
                                <p className="text-sm text-textColor-300">{currentResource.keywords}</p>
                            </div>)
                    )
                    :
                    <NoData />
                // <div className='metadata-icon-container'>
                //     <ErrorOutlineIcon className='workspace-icon'/>
                //     <p>No selected source in the workspace</p>
                // </div>
            }
        </div>
    );
};





export default MetadataPanel;