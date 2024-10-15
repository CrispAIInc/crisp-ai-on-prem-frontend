import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

import './StackedPaperEffect.css';

const StackedPaperEffect = ({ story }) => {

    const { setSelectedStory, setActiveView, setIsNewStory } = useContext(MainContext);

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
            <div className="parent" onClick={showStory}>
                <div className="letter">
                    <h4 className="mb-2 text-sm font-semibold text-gray-800">{story.story_name}</h4>
                    <p className="text-sm ">{story.text[0]?.content[0]?.answer?.split(' ').slice(0, 10).join(' ')}...</p>
                </div>
                <div className="before"></div>
                <div className="after"></div>
            </div>
        </OverlayTrigger>
    );
};

export default StackedPaperEffect;
