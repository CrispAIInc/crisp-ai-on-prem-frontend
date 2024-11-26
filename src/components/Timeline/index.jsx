import React from 'react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { MainContext } from '../../contexts/mainContext';
import { useContext } from 'react';

const chapters = [
    {
        img: "https://placehold.co/600x400",
        timestamps: ["00:00:00", "00:02:10"],
        title: "Chapter 1",
        description: "lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
    },
    {
        img: "https://placehold.co/600x400",
        timestamps: ["00:02:10", "00:04:20"],
        title: "Chapter 2",
        description: "lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
    },
    {
        img: "https://placehold.co/600x400",
        timestamps: ["00:04:20", "00:06:30"],
        title: "Chapter 3",
        description: "lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
    },
    {
        img: "https://placehold.co/600x400",
        timestamps: ["00:06:30", "00:08:40"],
        title: "Chapter 4",
        description: "lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
    },
    {
        img: "https://placehold.co/600x400",
        timestamps: ["00:08:40", "00:10:50"],
        title: "Chapter 5",
        description: "lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
    }
];

function Timeline({ theme }) {
    // const { theme } = useContext(MainContext);
    return (
        <div className="main h-[400px] overflow-y-auto  m-auto w-8/12 max-w-[90vw]">
            <div className="relative w-full mt-10 timeline before:absolute before:top-0 before:left-1/2 before:w-2 before:h-full before:bg-gradient-to-t before:from-white before:via-primary-300 before:to-white">
                {
                    chapters.map((chapter, index) => (
                        <>
                            <div className={`timeline-item relative w-1/2 p-2 ${index % 2 === 0 ? 'left-0 before:right-[-13px]' : 'left-1/2 text-left before:left-[-5px]'} before:absolute before:top-1/2  before:w-5 before:h-5 before:bg-primary-200 before:border before:rounded-full before:z-10`}>
                                <div className={`relative grid md:grid-cols-[30%,1fr] gap-3 p-3 bg-background rounded-md shadow-md content`}>
                                    <div className="w-full rounded-md min-w-2/6">
                                        <img src={chapter.img} alt="chapter" className="object-cover w-full h-full rounded-md" />
                                    </div>
                                    <div className={`flex flex-col gap-0 ${theme === 'dark' ? 'text-textColor-100' : " text-textColor-300"}`}>
                                        <h5 className='mb-0 text-sm text-primary-300'>
                                            <AccessTimeIcon size="small" /> {chapter.timestamps[0]} - {chapter.timestamps[1]}
                                        </h5>
                                        <h5 className="mb-0 text-lg font-semibold line-clamp-1">{chapter.title}</h5>
                                        <p className="text-sm truncate line-clamp-2 text-wrap">{chapter.description}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ))
                }
            </div>
        </div>
    );
}

export default Timeline;