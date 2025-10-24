import React, { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';
import { formatDuration, formatReadableDate } from '../../utils';

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
    test: 908390,
    tesdfsdfst: 908390,
    sfgfdg: 908390,
    tesdfsdfsdfst: 908390,
    tesdfsdfddfst: 908390,
    tesdfsdsdfsdffst: 908390,
    tsdfsdfesdfsdfst: 908390,
    tesdfsdsdfsdfst: 908390,
    tesdfsdfddst: 908390,
    tesdfsdfssdfsdffft: 908390,
} }) {
    const { theme } = useContext(MainContext);
    return (
        <div className={`p-4 w-[30vw] ${theme === 'light' ? "text-textColor-300 bg-[#f0f0f0]" : "text-textColor-100 bg-textColor-300"}`}>
            <h5 className='text-gradient-x'>Reel Properties</h5>
            <div className='flex flex-col mt-4'>
                {
                    Object.entries(reel).map(([key, value]) => {
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
                                    <strong key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {formatDuration(value)}
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
                <div className="flex-1">
                    <strong>Editing history</strong>
                    {/* make this section scrollable vertically */}
                    <div className="p-2 mt-2 overflow-y-auto border rounded max-h-32 bg-background_workspace">
                        {
                            [{ action: "Created", date: new Date('2024-01-01T12:00:00Z') }, { action: "Updated", date: new Date('2024-01-02T12:00:00Z') }, { action: "Created", date: new Date('2024-01-01T12:00:00Z') }, { action: "Updated", date: new Date('2024-01-02T12:00:00Z') }, { action: "Created", date: new Date('2024-01-01T12:00:00Z') }, { action: "Updated", date: new Date('2024-01-02T12:00:00Z') }, { action: "Created", date: new Date('2024-01-01T12:00:00Z') }, { action: "Updated", date: new Date('2024-01-02T12:00:00Z') },].map((edit, index) => (
                                <div key={index} className='mb-1'>
                                    {edit.action} on {formatReadableDate(edit.date)}
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReelProps;