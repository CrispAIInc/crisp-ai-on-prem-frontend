import { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import SelectedSourcesDropdown from "../SelectedSourcesDropdown";
import makeApiRequest from '../../api';
import toast from 'react-simple-toasts';


function MediaEntertainment() {

    const { theme, knowledgeBase } = useContext(MainContext);

    const [, setContextFocused] = useState(false);
    const [context, setContext] = useState('');

    const [selectedSourcesToGen, setSelectedSourcesToGen] = useState([]);

    const [isLoading, setIsLoading] = useState(false);

    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left - 60,
            y: e.clientY - rect.top + 10,
        });
    };

    const handleMouseEnter = () => selectedSourcesToGen.length === 0 && setTooltipVisible(true);
    const handleMouseLeave = () => setTooltipVisible(false);

    async function generateMedia() {
        try {
            setIsLoading(true);
            const res = await makeApiRequest('/generate-reel', 'POST', JSON.stringify({
                filename: selectedSourcesToGen[0].source_path,
                category: selectedSourcesToGen[0].category?.filter(item => item !== 'all')[0],
                context
            }));

            console.log(res);

            //TODO show video here or in another tab or something
        } catch (error) {
            console.log(error);
            toast(error?.response?.data?.error || "Something went wrong", { className: 'p-2 rounded-md z-20', theme });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className='flex flex-col gap-3'>
            {/* context */}
            <div className="relative w-full mt-6">
                <textarea
                    className={`w-full p-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-300 text-textColor-200" : '!border !border-textColor-100 text-textColor-300'} rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    rows="3"
                    placeholder='What do you want your reel to be about?'
                    onFocus={() => setContextFocused(true)}
                    onBlur={() => setContextFocused(false)}
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                />
            </div>

            {/* Source to generate reel */}
            <SelectedSourcesDropdown selectedOptions={selectedSourcesToGen} setSelectedOptions={setSelectedSourcesToGen} options={knowledgeBase} />

            {/* generate button */}
            <div className='relative inline-block' onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}>
                <button className='relative flex items-center justify-center w-full max-w-full gap-2 py-2 m-auto text-center text-white rounded-md cursor-not-allowed disabled:opacity-70 bg-primary-300/85 hover:bg-primary-300'
                    disabled={isLoading || selectedSourcesToGen.length === 0} onClick={generateMedia}>
                    {isLoading ? <><AutoAwesomeIcon color="primary" className="animate-customPulse" /> <span className="animate-customPulse">Generating...</span></> : 'Generate'}
                </button>
                {tooltipVisible && (
                    <p
                        // onMouseEnter={() => setTooltipVisible(false)}
                        className={`absolute p-2 text-sm font-semibold rounded shadow-2xl bg-background_workspace top-full ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}
                        style={{ top: position.y, left: position.x, opacity: tooltipVisible ? 1 : 0 }}
                    >
                        No source is selected
                    </p>
                )}
            </div>
        </div>
    );
}

export default MediaEntertainment;