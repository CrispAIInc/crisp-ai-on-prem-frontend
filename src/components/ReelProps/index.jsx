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

function ReelProps({ reel, closeReelProps = () => { } }) {
    const { filename, id, reel_video_url, thumbnail, user_id, combined_video_info, original_sources, video_filename, edl_url, source_frame_rates, reel_frame_rate, project_id, source_id, index_id, reel_url, category, ...rest } = reel;
    const {
        theme,
        knowledgeBase,
        categoryOptions
    } = useContext(MainContext);
    return (
        <div className={`p-4 w-[30vw] ${theme === 'light' ? "text-textColor-300 bg-[#f0f0f0]" : "text-textColor-100 bg-textColor-300"} flex-1 flex flex-col gap-3`}>
            <div className="flex items-center justify-between">
                <h5 className='mb-0 text-gradient-x'>Reel Properties</h5>
                <KeyboardReturnIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} className="rotate-180 cursor-pointer" onClick={closeReelProps} />
            </div>
            <div className='flex flex-col flex-1'>
                {/* reel metadata */}
                <Accordion IconComponent={<InfoOutlinedIcon fontSize='small' className="text-purple-700" />} fromReelProps chosenLanguage={"en"} heading="Reel metadata" isFirstOpen>
                    <div className="pl-3">
                        {
                            Object.entries(rest).filter(([key]) => (key !== "editing_history" && key !== "sources" && key !== "segments")).map(([key, value]) => {
                                return <div key={key + "" + Math.random()} className='mb-2'>

                                    <strong>{key.includes("_") ? key.split('_')[0].charAt(0).toUpperCase() + "" + key.split('_')[0].slice(1) + " " + key.split('_')[1] : key.charAt(0).toUpperCase() + key.slice(1)}: </strong>

                                    <span className="break-words">{/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value) ? formatReadableDate(new Date(value)) : value === "" ? "-" : value.toString()}</span>

                                </div>;
                            })
                        }
                        <strong>Reel duration: </strong>
                        <span>
                            {
                                formatDuration(reel?.segments?.reduce((sum, segment) => sum + (segment.duration || 0), 0))
                            }
                        </span>
                    </div>
                </Accordion>
                {/* videos used */}
                <Accordion IconComponent={<PlayCircleOutlineIcon fontSize='small' className="text-purple-700" />} fromReelProps chosenLanguage={"en"} heading="Sources used in this reel">
                    <div>
                        {/* <strong className='inline-block mb-2'>Videos Used:</strong> */}
                        <div className='flex flex-col flex-wrap gap-2'>
                            {reel?.sources?.map((video, index) => (
                                <div key={index} className='flex items-start gap-2 p-1 rounded'>
                                    {/* <img src={video.thumbnail} alt={video.source_path} className='w-12 h-12 rounded' /> */}
                                    <GsFile gsUrl={video.thumbnail} alt={reel.title} className="w-12 h-12 rounded" />
                                    <div className="flex flex-col">
                                        <p className='text-sm font-semibold break-all'>{knowledgeBase.find(item => item.source_id === video.source_id)?.source_path}</p>
                                        {!Array.isArray(video?.category) ? <Chip className="text-xs italic" cssClasses="italic !text-[10px] !px-1 !py-1" content={categoryOptions.find(item => item.id === video.index_id)?.label} />
                                            :
                                            <div className="flex flex-wrap items-center gap-1">
                                                {
                                                    video.category?.map((cat, index) => (
                                                        <Chip key={`${cat}-${index}`} cssClasses="italic !text-[10px] !px-1 !py-1" content={cat} />
                                                    ))
                                                }
                                            </div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Accordion>

                {/* Reel segments */}
                <Accordion IconComponent={<ViewWeekOutlinedIcon fontSize='small' className="text-purple-700" />} fromReelProps chosenLanguage={"en"} heading="Reel segments">
                    <div className='mb-4'>
                        {/* <strong className='inline-block mb-2'>Videos Used:</strong> */}
                        <div className='flex flex-col flex-wrap gap-2'>
                            {reel?.segments?.map((segment, index) => (
                                <>
                                    <div key={index} className='flex flex-col gap-2 p-1 rounded'>
                                        <div className="flex items-center gap-1">
                                            <div className="flex items-center gap-1">
                                                <TitleIcon fontSize='small' style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                                <h6 className="mb-0 text-sm break-all">{segment?.title}</h6>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <AccessTimeIcon fontSize='small' style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                            <h6 className="mb-0 text-sm break-all">{segment?.original_video_start_time} - {segment?.original_video_end_time}</h6>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <PlayCircleOutlineIcon fontSize='small' style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                            <h6 className="mb-0 text-sm break-all">{segment?.source_filename}</h6>
                                        </div>
                                    </div>
                                    <hr className="my-0 border-gray-300"></hr>
                                </>
                            ))}
                        </div>
                    </div>
                </Accordion>

                {/* editing history */}
                {/* <Accordion fromReelProps chosenLanguage={"en"} heading="Editing history" hideOverflow>
                    <div className="flex flex-col flex-1 h-full">
                        <div className={`p-2 mt-2 flex-1 overflow-y-auto  ${theme === 'light' ? '!border !border-light-hover-200' : '!border !border-textColor-200'} rounded bg-background_workspace`}>
                            <Timeline position="alternate">
                                {
                                    reel?.editing_history?.map(({ date, action }) => (
                                        <TimelineItem key={date.toISOString() + action}>
                                            <TimelineOppositeContent className="text-sm !font-bold text-gradient-x">
                                                {formatReadableDate(new Date(date))}
                                            </TimelineOppositeContent>
                                            <TimelineSeparator>
                                                <TimelineDot variant="outlined" color="secondary" />
                                                <TimelineConnector />
                                            </TimelineSeparator>
                                            <TimelineContent>{action}</TimelineContent>
                                        </TimelineItem>
                                    ))
                                }
                            </Timeline>
                        </div>
                    </div>
                </Accordion> */}
            </div>
        </div >
    );
}

export default ReelProps;