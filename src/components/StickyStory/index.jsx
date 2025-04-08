import { useContext, useEffect, useState, memo } from 'react';
import { MainContext } from '../../contexts/mainContext';

import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

function StickyStory({ story }) {
    const { theme, setSelectedStory, setActiveView, setIsNewStory } = useContext(MainContext);
    const [color, setColor] = useState('');

    useEffect(() => {
        // Function to generate a very light random hex color for better contrast on a dark background
        const generateLightRandomColor = () => {
            const letters = theme === "dark" ? 'EF' : "CDEF";
            let color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * letters.length)];
            }
            return color;
        };

        setColor(generateLightRandomColor());
    }, [theme]);

    const showStory = () => {
        setSelectedStory(story);
        setActiveView('story');
        setIsNewStory(false);
    };

    const renderTooltip = props => (
        <Tooltip className='h-auto truncate tooltip' {...props}>
            <p className="font-bold">{story.text[0]?.outline?.name}</p>
            <span>{story.text[0]?.content[0]?.answer?.split(' ').slice(0, 30).join(' ')}...</span>
        </Tooltip>
    );

    return (
        <OverlayTrigger className='tooltip' placement="right" overlay={renderTooltip}>
            <div
                className={`p-1 rounded-lg w-32 h-32 relative transform shadow-[rgba(0,0,15,0.5)_0px_8px_19px_-10px] flex flex-col cursor-pointer`}
                style={{
                    backgroundColor: color,
                    transform: `rotate(${Math.random() * 6 - 3}deg)`,
                }}
                onClick={showStory}
            >
                {/* top */}
                <h4 className="mb-2 text-sm font-semibold text-gray-800">{story.story_name}</h4>
                {
                    Array.isArray(story.text) && <div className={`my-0 text-xs ${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'} line-clamp-2`}>{story.text[0]?.content[0]?.answer}</div>
                }
            </div>
        </OverlayTrigger>
    );
}

export default memo(StickyStory);