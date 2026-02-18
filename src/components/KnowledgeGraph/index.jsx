import React, { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';
import RippleButton from '../RippleButton';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

function KnowledgeGraph() {

    const {
        theme,
        checkedSourcesCount
    } = useContext(MainContext);

    const [context, setContext] = useState('');
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isGeneratingReel, setIsGeneratingReel] = useState(false);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left - 60,
            y: e.clientY - rect.top + 10,
        });
    };

    const MAX_SOURCES_COUNT = 15;
    const handleMouseEnter = () => (checkedSourcesCount === 0 || checkedSourcesCount > MAX_SOURCES_COUNT) && setTooltipVisible(true);
    const handleMouseLeave = () => setTooltipVisible(false);

    return (
        <div className='flex flex-col gap-1 h-full'>
            <div className="relative w-full">
                <div className="flex flex-col mb-2">
                    <label className={`${theme === "dark" ? 'text-textColor-100' : 'text-textColor-200'} font-medium`}>Context prompt</label>
                    <span className={`${theme === "dark" ? 'text-textColor-100' : 'text-textColor-200'} text-sm`}>Constrain model behavior through schema-based contextual configuration.</span>
                </div>
                <textarea
                    className={`w-full p-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-200/50 rounded-md text-textColor-200" : '!border !border-textColor-100 text-textColor-300'} rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    rows="3"
                    placeholder='Customize your JSON structure'
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                />
            </div>
            {/* generate button */}
            <div className='relative inline-block' onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}>
                <RippleButton fullWidth cssClasses='flex items-center gap-1 disabled:cursor-not-allowed p-2'
                    disabled={isGeneratingReel || checkedSourcesCount === 0 || checkedSourcesCount > MAX_SOURCES_COUNT}>
                    {isGeneratingReel ? <><AutoAwesomeIcon color="white" className="animate-customPulse" /> <span className="animate-customPulse">Generating...</span></> : 'Generate'}
                </RippleButton>
                {tooltipVisible && (
                    <p
                        // onMouseEnter={() => setTooltipVisible(false)}
                        className={`absolute p-2 text-sm font-semibold rounded shadow-2xl bg-background_workspace top-full ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}
                        style={{ top: position.y, left: position.x, opacity: tooltipVisible ? 1 : 0 }}
                    >
                        {`Select at least one source. (max: ${MAX_SOURCES_COUNT} sources)`}
                    </p>
                )}
            </div>
        </div>
    );
}

export default KnowledgeGraph;