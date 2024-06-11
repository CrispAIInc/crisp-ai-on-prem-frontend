import { useContext } from 'react';
import NoData from "../NoData";
import { MainContext } from "../../contexts/mainContext.js";

const MetadataPanel = () => {

    const { currentResource, theme } = useContext(MainContext);

    return (
        <div className='px-2 metadata-wrapper'>
            {
                currentResource
                    ?
                    (
                        currentResource.file_type != 'img' ?
                            (<div className='metadata-container'>
                                <h3 className={`mt-4 text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>Summary</h3>
                                <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{currentResource.summary}</p>

                                <h3 className={`mt-4 text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>{currentResource.file_type === 'video' ? 'Topic by Topic Summary' : 'Detailed summary'}</h3>
                                <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{currentResource.topic_summaries}</p>
                                <h3 className={`mt-4 text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>

                                    {currentResource.file_type == 'video' ? 'Video Transcript' : 'PDF Transcript'}</h3>
                                <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{currentResource.transcript}</p>

                                <h3 className={`mt-4 text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>Key Topics</h3>
                                <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{currentResource.keywords}</p>
                            </div>)
                            :
                            (<div className='metadata-container'>
                                <h3 className={`mt-4 text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>Caption</h3>
                                <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{currentResource.caption}</p>

                                <h3 className={`mt-4 text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>Key Topics</h3>
                                <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{currentResource.keywords}</p>
                            </div>)
                    )
                    :
                    <NoData />
            }
        </div>
    );
};
export default MetadataPanel;