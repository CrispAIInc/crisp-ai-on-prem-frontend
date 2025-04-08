import { useEffect, useState, useContext, memo } from 'react';
import { MainContext } from '../../contexts/mainContext';
import ModelChip from '../ModelChip';

import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";


const StickyNote = ({ index, setNoteIndex, note }) => {
    const [color, setColor] = useState('');
    const previousModels = [];

    const { setSelectedNote,
        setIsNewNote, setShowNoteDetails, theme, setIsEditingTitle, setActiveView } = useContext(MainContext);

    const showSelectedNote = (event, note, index) => {
        event.preventDefault();
        setNoteIndex(index);
        setSelectedNote(note);
        setIsEditingTitle(false);
        setIsNewNote(false);
        setShowNoteDetails(true);
        setActiveView('note');
    };

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

    const renderTooltip = props => (
        <Tooltip className='h-auto truncate tooltip' {...props}>
            <p className="font-bold">{note.text[0]?.question}</p>
            <span>{note.text[0]?.answer?.split(' ').slice(0, 30).join(' ')}...</span>
        </Tooltip>
    );

    return (
        <OverlayTrigger className='tooltip' placement="right" overlay={renderTooltip}>
            <div
                className={`p-1 rounded-lg w-24 h-24 relative transform shadow-[rgba(0,0,15,0.5)_0px_8px_19px_-10px] flex flex-col cursor-pointer overflow-x-hidden`}
                style={{
                    backgroundColor: color,
                    // boxShadow: '0 15px 25px rgba(0, 0, 0, 0.2)', // Bottom-only shadow
                    transform: `rotate(${Math.random() * 6 - 3}deg)`, // Random slight rotation between -3 and 3 degrees
                }}
                onClick={(event) => showSelectedNote(event, note, index)}
            >
                {/* Note Content */}
                {/* <div> */}
                <h4 className="mb-1 text-[12px] font-semibold text-gray-800 truncate">{note.note_name}</h4>
                {
                    (Array.isArray(note.text) && note.text.length > 0) && <p className={`my-0 text-[10px] ${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'} line-clamp-2`}>{note.text[0]?.answer}</p>
                }

                {/* list of models used */}
                <div className="flex items-center flex-1 gap-1 mt-3 overflow-x-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                    {
                        Array.isArray(note.text) && note.text?.map((content, index) => {
                            if (content.model && !previousModels.includes(content.model)) {
                                previousModels.push(content.model);

                                return <ModelChip key={index} modelName={content.model.toUpperCase()} />;
                            }
                        })
                    }
                </div>
                {/* </div> */}
            </div>
        </OverlayTrigger>
    );
};

const MemoizedStickyNote = memo(StickyNote);
export default MemoizedStickyNote;