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

function KnowledgeGraph() {

    const { isProjectReadOnly } = useContext(ProjectContext);

    const {
        theme,
        checkedSourcesCount,
        checkedSources,
        setJsonEntities,
        setSelectedJsonEntity
    } = useContext(MainContext);

    const [context, setContext] = useState('');
    const [ontology, setOntology] = useState('');
    const [title, setTitle] = useState('');
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isGeneratingGraph, setIsGeneratingGraph] = useState(false);
    const [showGraphModal, setShowGraphModal] = useState(false);
    const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(true);


    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left - 60,
            y: e.clientY - rect.top + 10,
        });
    };



    const MAX_SOURCES_COUNT = 1;

    const checkedVideoSource = checkedSources.filter(source => source.file_type === 'video')[0];

    const sourceHasMetadata = Boolean(checkedVideoSource.metadata?.summary?.content?.length > 0 && checkedVideoSource.metadata?.highlights?.content?.length > 0 && checkedVideoSource.metadata?.chapters?.content?.length > 0);

    const canGenerate = checkedSourcesCount > 0 && checkedSourcesCount <= MAX_SOURCES_COUNT && !isProjectReadOnly;

    const handleMouseEnter = () => !canGenerate && setTooltipVisible(true);
    const handleMouseLeave = () => setTooltipVisible(false);

    const [chosenLanguage, setChosenLanguage] = useState(checkedVideoSource?.originalSourceLanguage || "en");

    const { generateMetadata } = useMetadata();

    async function generateGraph() {
        try {
            if (!canGenerate) return;
            setIsGeneratingGraph(true);

            if (!sourceHasMetadata) {
                await generateMetadata("", "medium", [{ id: "summary" }, { id: "highlights" }, { id: "chapters" }], [checkedVideoSource]);
                return;
            }

            const payload = {
                sources: { file_type: checkedVideoSource.file_type, source_path: checkedVideoSource.source_path, category: Array.isArray(checkedVideoSource.category) ? checkedVideoSource.category.filter(cat => cat !== "all")[0] : checkedVideoSource.category },
                selectedOptions: ["graph"],
                inputContext: context,
                ontology,
                title
            };
            let response = await makeApiRequest('/graph', 'POST', payload);

            setSelectedJsonEntity(response);
            setJsonEntities(prev => [...prev, response]);
            setShowGraphModal(true);
        } catch (error) {
            console.log(error);
        } finally {
            setIsGeneratingGraph(false);
        }
    }

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
                    <div className="relative w-full mb-2">
                        <div className="relative flex items-center gap-1">
                            <label className={`${theme === "dark" ? 'text-textColor-100' : 'text-textColor-200'} font-medium mb-1`}>Business Schema (optional)</label>
                            <InfoOutlinedIcon onMouseOver={() => setIsInfoTooltipOpen(true)} onMouseLeave={() => setIsInfoTooltipOpen(false)} className={`!relative !w-5`} />

                            {
                                isInfoTooltipOpen && (
                                    <div className={`absolute right-0 p-2 bg-background_workspace shadow-md rounded-md w-[300px] max-w-[300px] left-0 z-40 top-full ${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'} text-sm`}>If no business schema was provided, the generation will be based on the context.</div>
                                )
                            }
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
                            {isGeneratingGraph ? <><AutoAwesomeIcon color="white" className="animate-customPulse" /> <span className="animate-customPulse">Generating...</span></> : 'Generate'}
                        </RippleButton>

                        {/* tooltip */}
                        {tooltipVisible && (
                            <p
                                // onMouseEnter={() => setTooltipVisible(false)}
                                className={`absolute p-2 text-sm font-semibold rounded shadow-2xl bg-background_workspace top-full ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}
                                style={{ top: position.y, left: position.x, opacity: tooltipVisible ? 1 : 0 }}
                            >
                                {isProjectReadOnly ? "Cannot edit an example project." : `Select at least one source. (max: ${MAX_SOURCES_COUNT} sources)`}
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