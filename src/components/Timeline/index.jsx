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
        <div className="main  overflow-y-auto overflow-x-hidden relative  m-auto w-6/12  max-w-[90vw] ">
            {/* <div className="sticky top-0 left-0 right-0 z-20 h-8 pointer-events-none bg-gradient-to-b from-background to-transparent"></div> */}

            <div className="relative w-full timeline before:absolute before:rounded-lg before:top-0 before:left-1/2 before:w-1 before:h-full before:bg-primary-300">
                {
                    chapters.map((chapter, index) => (
                        <>
                            <div className={`timeline-item relative w-1/2 p-2 ${index % 2 === 0 ? 'left-0 before:right-[0px] before:border-r-blue-500  before:border-r-8' : 'left-1/2 text-left before:left-[-6px] ml-[9px] before:border-l-8 before:border-l-blue-500'} before:absolute before:top-1/2 before:-translate-y-1/2  before:w-0 before:h-0  before:border before:border-t-8 before:border-b-8  before:border-transparent before:z-10`}>
                                <div className={`relative grid md:grid-cols-[30%,1fr] gap-3 p-3 bg-background rounded-md shadow-md content`}>
                                    {/* <div className="absolute right-0 w-0 h-0 mr-4 border-t-8 border-b-8 border-r-8 border-transparent border-r-blue-500"></div> */}
                                    <div className="w-full rounded-md min-w-2/6">
                                        <img src={chapter.img} alt="chapter" className="object-cover w-full h-full rounded-md" />
                                    </div>
                                    <div className={`flex flex-col gap-0 ${theme === 'dark' ? 'text-textColor-100' : " text-textColor-300"}`}>
                                        <h5 className='mb-0 text-[9px] cursor-pointer text-primary-300 w-fit'>
                                            <AccessTimeIcon size="small" /> {chapter.timestamps[0]} - {chapter.timestamps[1]}
                                        </h5>
                                        <h5 className="mb-0 text-lg font-semibold line-clamp-1">{chapter.title}</h5>
                                        <p className="text-xs truncate line-clamp-2 text-wrap">{chapter.description}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ))
                }
            </div>

            {/* <div className="sticky bottom-0 left-0 right-0 z-20 h-8 pointer-events-none bg-gradient-to-t from-background to-transparent"></div> */}
        </div>
    );
}

export default Timeline;