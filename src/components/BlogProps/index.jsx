import React, { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';
import { formatDuration, formatReadableDate } from '../../utils';
import TitleIcon from '@mui/icons-material/Title';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import Accordion from "../Accordion";
import ViewWeekOutlinedIcon from '@mui/icons-material/ViewWeekOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import GsFile from '../GsFile';
import Chip from '../Chip';

function BlogProps({ closeBlogProps = () => { } }) {

    const {
        theme,
        selectedBlog,
        knowledgeBase,
    } = useContext(MainContext);

    const sourceObject = knowledgeBase.find(item => item.source_path === selectedBlog.source_path);


    return (
        <div className={`p-4 w-[30vw] ${theme === 'light' ? "text-textColor-300 bg-[#f0f0f0]" : "text-textColor-100 bg-textColor-300"} flex-1 flex flex-col gap-3`}>
            <div className="flex items-center justify-between">
                <h5 className='mb-0 text-gradient-x'>Blog history</h5>
                <KeyboardReturnIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} className="rotate-180 cursor-pointer" onClick={closeBlogProps} />
            </div>

            <div className='flex flex-col flex-1'>
                {/* Blog general info */}
                <Accordion IconComponent={<InfoOutlinedIcon fontSize='small' className="text-purple-700" />} fromReelProps chosenLanguage={"en"} heading="General details" isFirstOpen>
                    <div className="pl-3">
                        {/* creation date */}
                        <div className='mb-2'>

                            <strong>Creation date & time:: </strong>

                            <span className="break-words">
                                {
                                    formatReadableDate(new Date(selectedBlog.created_at))
                                }
                            </span>
                        </div>

                        {/* filename */}
                        <div className='mb-2'>

                            <strong>Filename: </strong>

                            <span className="break-words">{selectedBlog.filename}</span>
                        </div>


                        {/* title */}
                        <div className='mb-2'>

                            <strong>Blog title: </strong>

                            <span className="break-words">{selectedBlog.title}</span>
                        </div>
                    </div>
                </Accordion>
            </div>
        </div >
    );
}

export default BlogProps;