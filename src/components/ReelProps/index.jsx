import React, { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';
import { formatDuration, formatReadableDate } from '../../utils';
import AccessTimeFilledOutlinedIcon from '@mui/icons-material/AccessTimeFilledOutlined';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import Accordion from "../Accordion";
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';

function ReelProps({ reel = {
    created_at: new Date('2024-01-01T12:00:00Z'),
    updated_at: new Date('2024-01-02T12:00:00Z'),
    title: 'Sample Reel',
    description: 'This is a sample reel description.',
    context: "Sample context for the reel.",
    reel_duration: 143,
    videos_used: [
        { source_path: "Usain Bold.mp4", thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Usain_Bolt%2C_Anniversary_Games%2C_London_2013.jpg/250px-Usain_Bolt%2C_Anniversary_Games%2C_London_2013.jpg" },
        { source_path: "Sample Video 2.mp4", thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Usain_Bolt%2C_Anniversary_Games%2C_London_2013.jpg/250px-Usain_Bolt%2C_Anniversary_Games%2C_London_2013.jpg" },
        { source_path: "Sample Video 3.mp4", thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Usain_Bolt%2C_Anniversary_Games%2C_London_2013.jpg/250px-Usain_Bolt%2C_Anniversary_Games%2C_London_2013.jpg" }
    ],
    // reel history
    editing_history: [
        { action: "Started a new reel titled “My Coorg travel Adventure”", date: new Date('2024-01-01T12:00:00Z') },
        { action: "Changed title to “Coorg nature trip Highlights”", date: new Date('2024-01-02T12:00:00Z') },
        { action: "Adjusted highlight segment from 00:10–00:25 to 00:12–00:28", date: new Date('2024-01-03T12:00:00Z') },
        { action: "Adjusted highlight segment from 00:10–00:25 to 00:12–00:28", date: new Date('2024-01-03T12:00:00Z') },
        { action: "Adjusted highlight segment from 00:10–00:25 to 00:12–00:28", date: new Date('2024-01-03T12:00:00Z') },
        { action: "Adjusted highlight segment from 00:10–00:25 to 00:12–00:28", date: new Date('2024-01-03T12:00:00Z') },
        { action: "Adjusted highlight segment from 00:10–00:25 to 00:12–00:28", date: new Date('2024-01-03T12:00:00Z') },
        { action: "Adjusted highlight segment from 00:10–00:25 to 00:12–00:28", date: new Date('2024-01-03T12:00:00Z') },
        { action: "Adjusted highlight segment from 00:10–00:25 to 00:12–00:28", date: new Date('2024-01-03T12:00:00Z') },
        { action: "Adjusted highlight segment from 00:10–00:25 to 00:12–00:28", date: new Date('2024-01-03T12:00:00Z') },
        { action: "Adjusted highlight segment from 00:10–00:25 to 00:12–00:28", date: new Date('2024-01-03T12:00:00Z') },
        { action: "Adjusted highlight segment from 00:10–00:25 to 00:12–00:28", date: new Date('2024-01-03T12:00:00Z') },
        { action: "Adjusted highlight segment from 00:10–00:25 to 00:12–00:28", date: new Date('2024-01-03T12:00:00Z') },
        { action: "Adjusted highlight segment from 00:10–00:25 to 00:12–00:28", date: new Date('2024-01-03T12:00:00Z') },
    ]
}, closeReelProps = () => { } }) {

    console.log(Object.entries(reel));
    console.log(Object.entries(reel).filter(([key]) => (key !== "editingHistory" && key !== "videosUsed")));
    const { theme } = useContext(MainContext);
    return (
        <div className={`p-4 w-[30vw] ${theme === 'light' ? "text-textColor-300 bg-[#f0f0f0]" : "text-textColor-100 bg-textColor-300"} flex-1 flex flex-col gap-3 max-h-full overflow-y-hidden`}>
            <div className="flex items-center justify-between">
                <h5 className='mb-0 text-gradient-x'>Reel Properties</h5>
                <KeyboardReturnIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} className="rotate-180 cursor-pointer" onClick={closeReelProps} />
            </div>
            <div className='flex flex-col flex-1 overflow-y-hidden'>
                <Accordion chosenLanguage={"en"} heading="Reel metadata" isFirstOpen>
                    <div className="pl-3">
                        {
                            Object.entries(reel).filter(([key]) => (key !== "editing_history" && key !== "videos_used")).map(([key, value]) => {
                                return <div key={key + "" + crypto.randomUUID} className='mb-2'>
                                    <strong>{key.includes("_") ? key.split('_')[0].charAt(0) + "" + key.split('_')[0].slice(1) + " " + key.split('_')[1] : key.charAt(0) + key.slice(1)}:</strong> {value instanceof Date ? formatReadableDate(new Date(value)) : key === "reel_duration" ? formatDuration(value) : value.toString()}
                                </div>;
                            })
                        }
                    </div>
                </Accordion>
                {/* videos used */}
                <Accordion chosenLanguage={"en"} heading="Videos Used">
                    <div className='mb-4'>
                        {/* <strong className='inline-block mb-2'>Videos Used:</strong> */}
                        <div className='flex flex-col flex-wrap gap-2'>
                            {reel.videos_used.map((video, index) => (
                                <div key={index} className='flex items-center gap-2 p-1 rounded shadow-lg'>
                                    <img src={video.thumbnail} alt={video.source_path} className='w-12 h-12 rounded' />
                                    <p className='text-sm font-semibold truncate'>{video.source_path}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </Accordion>
                {/* editing history */}
                <Accordion chosenLanguage={"en"} heading="Editing history" fromReelProps={true}>
                    <div className="flex flex-col flex-1 h-full">
                        {/* <strong>Editing history</strong> */}
                        {/* make this section scrollable vertically */}
                        <div className={`p-2 mt-2 flex-1 overflow-y-auto  ${theme === 'light' ? '!border !border-light-hover-200' : '!border !border-textColor-200'} rounded bg-background_workspace`}>
                            <Timeline position="alternate">
                                {
                                    reel.editing_history.map(({ date, action }) => (
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
                </Accordion>
            </div>
        </div >
    );
}

export default ReelProps;