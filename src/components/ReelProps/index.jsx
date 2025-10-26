import React, { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';
import { formatDuration, formatReadableDate } from '../../utils';
import AccessTimeFilledOutlinedIcon from '@mui/icons-material/AccessTimeFilledOutlined';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';

function ReelProps({ reel = {
    createdAt: new Date('2024-01-01T12:00:00Z'),
    updatedAt: new Date('2024-01-02T12:00:00Z'),
    title: 'Sample Reel',
    description: 'This is a sample reel description.',
    videosUsed: [
        { source_path: "Usain Bold.mp4", thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Usain_Bolt%2C_Anniversary_Games%2C_London_2013.jpg/250px-Usain_Bolt%2C_Anniversary_Games%2C_London_2013.jpg" },
        { source_path: "Sample Video 2.mp4", thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Usain_Bolt%2C_Anniversary_Games%2C_London_2013.jpg/250px-Usain_Bolt%2C_Anniversary_Games%2C_London_2013.jpg" },
        { source_path: "Sample Video 3.mp4", thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Usain_Bolt%2C_Anniversary_Games%2C_London_2013.jpg/250px-Usain_Bolt%2C_Anniversary_Games%2C_London_2013.jpg" }
    ],
    context: "Sample context for the reel.",
    reelDuration: 143,
    // reel history
    editingHistory: [
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
    const { theme } = useContext(MainContext);
    return (
        <div className={`p-4 w-[30vw] ${theme === 'light' ? "text-textColor-300 bg-[#f0f0f0]" : "text-textColor-100 bg-textColor-300"} flex-1 flex flex-col gap-3 max-h-full overflow-y-hidden`}>
            <div className="flex items-center justify-between">
                <h5 className='text-gradient-x'>Reel Properties</h5>
                <KeyboardReturnIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} className="rotate-180 cursor-pointer" onClick={closeReelProps} />
            </div>
            <div className='flex flex-col flex-1 overflow-y-hidden'>
                {
                    Object.entries(reel).filter(([key, value]) => key !== "editingHistory").map(([key, value]) => {
                        if (key === 'videosUsed') {
                            return (
                                <div key={key} className='mb-4'>
                                    <strong className='inline-block mb-2'>Videos Used:</strong>
                                    <div className='flex flex-col flex-wrap gap-2'>
                                        {value.map((video, index) => (
                                            <div key={index} className='flex items-center gap-2 p-1 rounded shadow-lg'>
                                                <img src={video.thumbnail} alt={video.source_path} className='w-12 h-12 rounded' />
                                                <p className='text-sm font-semibold truncate'>{video.source_path}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        } else if (key === "reelDuration") {
                            return (
                                <div key={key} className='mb-2'>
                                    <strong key={key}>Reel duration:</strong> {formatDuration(value)}
                                </div>
                            );
                        } else {
                            return (
                                <div key={key} className='mb-2'>
                                    <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {key.includes('At') ? formatReadableDate(new Date(value)) : value.toString()}
                                </div>
                            );
                        }
                    })
                }
                {/* editing history */}
                <div className="flex flex-col flex-1 h-full overflow-y-hidden">
                    <strong>Editing history</strong>
                    {/* make this section scrollable vertically */}
                    <div className={`p-2 mt-2 flex-1 overflow-y-auto  ${theme === 'light' ? '!border !border-light-hover-200' : '!border !border-textColor-200'} rounded bg-background_workspace`}>
                        {
                            reel.editingHistory.map((edit, index) => (
                                <div key={index} className='flex flex-col mb-1'>
                                    <div>
                                        <AccessTimeFilledOutlinedIcon fontSize="small" className="inline-block mb-1 mr-1 text-purple-400" />
                                        <span className="font-semibold text-gradient-x">{formatReadableDate(edit.date)}</span>
                                    </div>
                                    <p className='text-sm'>{edit.action}</p>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div >
    );
}

export default ReelProps;