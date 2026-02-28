import React, { useContext, useState } from 'react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import BaseHeading from '../BaseHeading';
import { MainContext } from '../../contexts/mainContext';
import TimeSegmentDescription from '../TimeSegmentDescription';

const VideoSegmentDescription = () => {

    const { theme } = useContext(MainContext);

    const [currentTab, setCurrentTab] = useState("Time segment description");

    return (
        <div className="">
            <div className="relative z-10 flex flex-col gap-1 mt-2 mb-3">
                {
                    [
                        {
                            icon: NotesOutlinedIcon,
                            title: "Time segment description"
                        },
                        {
                            icon: AutoAwesomeIcon,
                            title: "Time segment summary"
                        },
                        {
                            icon: AccessTimeOutlinedIcon,
                            title: "Find moments"
                        },
                    ].map(({ icon: Icon, title }, index) => {
                        return (
                            <div className={`cursor-pointer flex items-center gap-1 pb-1 ${title === currentTab ? ' !text-primary-300' : ''}`} key={title} onClick={() => setCurrentTab(title)}>
                                <Icon className={`${title !== currentTab && (theme === 'light' ? 'text-textColor-200' : 'text-[#ABAEB4]')}`} />
                                <BaseHeading key={index} text={title} className={` font-extrabold !text-[12px] ${title === currentTab ? ' !text-primary-300' : ''}`} />
                            </div>
                        );
                    })
                }
            </div>

            <TimeSegmentDescription
                start={0}
                setStart={() => { }}
                end={0}
                setEnd={() => { }}
                confirmFn={() => { }}
                rejectFn={() => { }}
            />
        </div>
    );
};

export default VideoSegmentDescription;