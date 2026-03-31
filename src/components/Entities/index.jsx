import { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';
import RippleButton from '../RippleButton';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import makeApiRequest from '../../api';
import JsonEntityModal from '../JsonEntityModal';
import JsonEntitiesList from '../JsonEntitiesList';
import { ProjectContext } from '../../contexts/projectContext';
import useMetadata from '../../hooks/useMetadata';

function KnowledgeGraph({
    context,
    setContext,
    ontology,
    setOntology,
    title,
    setTitle,
    isGeneratingGraph,
    showGraphModal,
    setShowGraphModal,
    canGenerate,
    step,
    generateGraph,
}) {

    const { isProjectReadOnly } = useContext(ProjectContext);

    const {
        theme,
    } = useContext(MainContext);


    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(true);


    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left - 60,
            y: e.clientY - rect.top + 10,
        });
    };



    const MAX_SOURCES_COUNT = 1;



    const handleMouseEnter = () => !canGenerate && setTooltipVisible(true);
    const handleMouseLeave = () => setTooltipVisible(false);



    const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);

    return (
        <>
            <div className='flex flex-col gap-1 h-full'>

                {/* collapser */}
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsDropdownMenuOpen(!isDropdownMenuOpen)}>
                    <p className={`select-none font-bold ${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'}`}>
                        {isDropdownMenuOpen ? "Minimize" : "Expand"} settings
                    </p>
                    <svg
                        className={`w-4 mx-2 transform ${isDropdownMenuOpen ? "rotate-180" : "rotate-0"
                            }`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke={`${theme === 'light' ? 'currentColor' : 'white'}`}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>

                <div className={`flex flex-col gap-2 ${isDropdownMenuOpen ? 'block' : 'hidden'}`}>
                    <div className="relative w-full">
                        <div className="flex flex-col mb-2">
                            <label className={`${theme === "dark" ? 'text-textColor-100' : 'text-textColor-200'} font-medium`}>Context prompt</label>
                            <span className={`${theme === "dark" ? 'text-textColor-100' : 'text-textColor-200'} text-sm`}>
                                {/* (Optional) Provide additional context or instructions to guide the JSON generation process. This can include specific themes, styles, or elements you want to see in the generated content. */}
                                Constrain model behavior through schema-based contextual configuration.
                            </span>
                        </div>
                        <input
                            className={`w-full p-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-200/50 text-textColor-200" : '!border !border-textColor-100 text-textColor-300'} rounded-xl resize-none focus:outline-none`}
                            placeholder='e.g. Travel, finance.'
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="relative flex items-center gap-1 flex-1">
                                <label className={`${theme === "dark" ? 'text-textColor-100' : 'text-textColor-200'} font-medium mb-1`}>Business Schema (optional)</label>
                                <InfoOutlinedIcon onMouseOver={() => setIsInfoTooltipOpen(true)} onMouseLeave={() => setIsInfoTooltipOpen(false)} className={`!relative !w-5`} />

                                {
                                    isInfoTooltipOpen && (
                                        <div className={`absolute right-0 p-2 bg-background_workspace shadow-md rounded-md w-[300px] max-w-[300px] left-0 z-40 top-full ${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'} text-sm`}>If no business schema was provided, the generation will be based on the context.</div>
                                    )
                                }
                            </div>
                            <button className={`font-medium text-sm p-2 bg-transparent !border ${theme === "dark" ? "text-textColor-100 !border !border-textColor-200/50" : '!border !border-textColor-100'} rounded-xl focus:outline-none`}
                                onClick={() => document.getElementById('jsonFileInput').click()}
                            >
                                Upload JSON
                            </button>
                            <input type="file" id="jsonFileInput" accept=".json" style={{ display: 'none' }} onChange={(e) => {
                                const file = e.target.files[0];
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                    try {
                                        const jsonContent = JSON.parse(event.target.result);
                                        setOntology(JSON.stringify(jsonContent));
                                    } catch (error) {
                                        console.error('Invalid JSON file:', error);
                                    }
                                };
                                reader.readAsText(file);
                            }} />
                        </div>
                        <textarea
                            rows="3"
                            className={`font-medium p-2 bg-transparent !border ${theme === "dark" ? "text-textColor-100 !border !border-textColor-200/50" : '!border !border-textColor-100'} rounded-xl focus:outline-none w-full`}
                            placeholder="provide a business schema for more accurate results"
                            value={ontology}
                            onChange={(e) => setOntology(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full mb-2">
                        <label className={`${theme === "dark" ? 'text-textColor-100' : 'text-textColor-200'} font-medium mb-1`}>Your entities title (optional)</label>
                        <input
                            className={`font-medium p-2 bg-transparent !border ${theme === "dark" ? "text-textColor-100 !border !border-textColor-200/50" : '!border !border-textColor-100'} rounded-xl focus:outline-none w-full`}
                            placeholder="Write a title for the entities"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    {/* generate button */}
                    <div className={`relative inline-block`} onMouseMove={handleMouseMove}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}>

                        <RippleButton
                            onClick={generateGraph}
                            fullWidth
                            cssClasses='flex items-center gap-1 disabled:cursor-not-allowed p-2'
                            disabled={isGeneratingGraph || !canGenerate}>
                            {isGeneratingGraph ? <><AutoAwesomeIcon color="white" className="animate-customPulse" /> <span className="animate-customPulse">{step}</span></> : 'Generate'}
                        </RippleButton>

                        {/* tooltip */}
                        {tooltipVisible && (
                            <p
                                // onMouseEnter={() => setTooltipVisible(false)}
                                className={`absolute p-2 text-sm font-semibold rounded shadow-2xl bg-background_workspace top-full ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}
                                style={{ top: position.y, left: position.x, opacity: tooltipVisible ? 1 : 0 }}
                            >
                                {isProjectReadOnly ? "Cannot edit an example project." : context?.trim() === "" ? "Context must be provided." : `Select at least one source. (max: ${MAX_SOURCES_COUNT} sources)`}
                            </p>
                        )}
                    </div>
                </div>

                {/* list of JSON structures */}
                <div className="flex flex-col mt-2 mb-2 gap-2 h-full overflow-hidden">
                    <JsonEntitiesList />
                </div>
            </div>

            {showGraphModal && <JsonEntityModal show={showGraphModal} onHide={() => setShowGraphModal(false)} />}
        </>
    );
}

export default KnowledgeGraph;