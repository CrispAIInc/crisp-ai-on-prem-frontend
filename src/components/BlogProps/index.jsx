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

    const sourcesUsed = knowledgeBase.filter(item => item.source_path === selectedBlog.source_path) || [];


    return (
        <div className={`p-4 w-[30vw] ${theme === 'light' ? "text-textColor-300 bg-[#f0f0f0]" : "text-textColor-100 bg-textColor-300"} flex-1 flex flex-col gap-3`}>
            <div className="flex items-center justify-between ">
                <h5 className='mb-0 text-gradient-x'>Blog history</h5>
                <KeyboardReturnIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} className="rotate-180 cursor-pointer" onClick={closeBlogProps} />
            </div>

            <div className='flex flex-col flex-1'>
                {/* Blog general info */}
                <Accordion IconComponent={<InfoOutlinedIcon fontSize='small' className="text-purple-700" />} fromReelProps chosenLanguage={"en"} heading="General details" isFirstOpen>
                    <div className="pl-3">
                        {/* creation date */}
                        <div className='mb-2'>

                            <strong>Creation date & time: </strong>

                            <span className="break-words">
                                {
                                    selectedBlog?.created_at ? formatReadableDate(new Date(selectedBlog.created_at)) : "-"
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


                {/* videos used */}
                <Accordion IconComponent={<PlayCircleOutlineIcon fontSize='small' className="text-purple-700" />} fromReelProps chosenLanguage={"en"} heading="Sources used in this blog" isFirstOpen>
                    <div>
                        {/* <strong className='inline-block mb-2'>Videos Used:</strong> */}
                        <div className='flex flex-col flex-wrap gap-2'>
                            {sourcesUsed?.map((video, index) => (
                                <div key={index} className='flex items-start gap-2 p-1 rounded'>
                                    {/* <img src={video.thumbnail} alt={video.source_path} className='w-12 h-12 rounded' /> */}
                                    <GsFile gsUrl={video.thumbnail} alt={video.source_path} className="w-12 h-12 rounded" />
                                    <div className="flex flex-col gap-0">
                                        <div className="flex items-center gap-2">
                                            <p className='text-sm font-semibold break-all'>{video.source_path}</p>
                                            {/* {
                                                !Array.isArray(video?.category) ? <Chip cssClasses="italic !text-[8px] !px-1" content={video.category} />
                                                    :
                                                    <div className="flex flex-wrap items-center gap-1">
                                                        {
                                                            video.category?.map((cat, index) => (
                                                                <Chip key={`${cat}-${index}`} cssClasses="italic !text-[8px] !px-1" content={cat} />
                                                            ))
                                                        }
                                                    </div>
                                            } */}
                                        </div>

                                        {/* time segments */}
                                        <div className="flex items-center gap-1 mt-1">
                                            <AccessTimeIcon fontSize='small' className="text-gray-500" />
                                            <span className="text-xs text-gray-500 tracking-wide font-bold">
                                                {selectedBlog.range_from} - {selectedBlog.range_to}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Accordion>
            </div>
        </div >
    );
}

export default BlogProps;