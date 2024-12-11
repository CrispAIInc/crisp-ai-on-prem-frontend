import React from 'react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { MainContext } from '../../contexts/mainContext';
import { useContext } from 'react';
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

// const chapters = [
//     {
//         img: "https://placehold.co/600x400",
//         timestamps: ["00:00:00", "00:02:10"],
//         title: "Chapter 1 ",
//         description: "lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
//     },
//     {
//         img: "https://placehold.co/600x400",
//         timestamps: ["00:02:10", "00:04:20"],
//         title: "Chapter 2",
//         description: "lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
//     },
//     {
//         img: "https://placehold.co/600x400",
//         timestamps: ["00:04:20", "00:06:30"],
//         title: "Chapter 3",
//         description: "lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
//     },
//     {
//         img: "https://placehold.co/600x400",
//         timestamps: ["00:06:30", "00:08:40"],
//         title: "Chapter 4",
//         description: "lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
//     },
//     {
//         img: "https://placehold.co/600x400",
//         timestamps: ["00:08:40", "00:10:50"],
//         title: "Chapter 5",
//         description: "lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
//     },
//     {
//         img: "https://placehold.co/600x400",
//         timestamps: ["00:10:50", "00:13:00"],
//         title: "Chapter 6",
//         description: "lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
//     },
//     {
//         img: "https://placehold.co/600x400",
//         timestamps: ["00:13:00", "00:15:10"],
//         title: "Chapter 7",
//         description: "lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
//     },
//     {
//         img: "https://placehold.co/600x400",
//         timestamps: ["00:15:10", "00:17:20"],
//         title: "Chapter 8",
//         description: "lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
//     },
//     {
//         img: "https://placehold.co/600x400",
//         timestamps: ["00:17:20", "00:19:30"],
//         title: "Chapter 9",
//         description: "lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
//     },
//     {
//         img: "https://placehold.co/600x400",
//         timestamps: ["00:19:30", "00:21:40"],
//         title: "Chapter 10",
//         description: "lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
//     },


// ];

function TimelineHorizontal({ theme, chapters, workspaceContainer }) {

    const { setCurrentResource } = useContext(MainContext);

    const renderTooltip = (props, content) => (
        <Tooltip className='h-auto truncate tooltip' {...props}>{content}</Tooltip>
    );

    return (
        <div className="main overflow-x-auto overflow-y-hidden relative m-auto w-11/12 max-w-[90vw] py-10 custom-scroll">
            {/* Horizontal timeline container */}
            <div className="relative flex items-center w-max before:absolute before:top-1/2 before:left-0 before:h-1 before:rounded-full before:w-full before:bg-primary-300 before:-translate-y-1/2">
                {chapters.map((chapter, index) => (
                    <div
                        key={index}
                        className={`timeline-item  relative flex-shrink-0 w-48 p-4 ${index % 2 === 0 ? 'mt-10' : 'mb-10'
                            }`}
                    >
                        {/* Connector line for each dot */}
                        {/* <div className="absolute z-10 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full top-1/2 left-1/2 bg-primary-300"></div> */}

                        {/* Timeline content */}
                        <div className="relative flex flex-col gap-2 p-2 rounded-md shadow-md bg-background">
                            {/* Image */}
                            <div className="w-full rounded-md">
                                <img
                                    src={chapter.img}
                                    alt="chapter"
                                    className="object-cover w-full h-20 rounded-md"
                                />
                            </div>
                            {/* Text Content */}
                            <div
                                className={`flex flex-col gap-0 ${theme === 'dark'
                                    ? 'text-textColor-100'
                                    : 'text-textColor-300'
                                    }`}
                            >
                                <h5 className="mb-0 text-[9px] cursor-pointer text-primary-300 w-fit" onClick={() => {

                                    setCurrentResource(prev => ({ ...prev, timestamp: chapter.timestamps[0] }));
                                    workspaceContainer.current.scrollTo({
                                        top: 0,
                                        behavior: "smooth", // Enables smooth scrolling
                                    });
                                }}>
                                    <AccessTimeIcon size="small" /> {chapter.timestamps[0]} -{' '}
                                    {chapter.timestamps[1]}
                                </h5>
                                <h5 className="mb-0 text-xs font-bold line-clamp-3">
                                    <abbr title={chapter.title}>{chapter.title}</abbr>
                                </h5>
                                <OverlayTrigger className='tooltip' placement="bottom" overlay={(props) => renderTooltip(props, chapter.description)}>
                                    <p className="text-xs truncate line-clamp-2 text-wrap">
                                        {chapter.description}
                                    </p>
                                </OverlayTrigger>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TimelineHorizontal;