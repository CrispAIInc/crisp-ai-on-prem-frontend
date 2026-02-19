import { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';
import RippleButton from '../RippleButton';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import makeApiRequest from '../../api';
import JsonEntityModal from '../JsonEntityModal';
import JsonEntitiesList from '../JsonEntitiesList';

function KnowledgeGraph() {

    const {
        theme,
        checkedSourcesCount,
        checkedSources,
        setJsonEntities,
        setSelectedJsonEntity
    } = useContext(MainContext);

    const [context, setContext] = useState('');
    const [title, setTitle] = useState('');
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isGeneratingGraph, setIsGeneratingGraph] = useState(false);
    const [showGraphModal, setShowGraphModal] = useState(false);


    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left - 60,
            y: e.clientY - rect.top + 10,
        });
    };

    const MAX_SOURCES_COUNT = 1;
    const handleMouseEnter = () => (checkedSourcesCount === 0 || checkedSourcesCount > MAX_SOURCES_COUNT) && setTooltipVisible(true);
    const handleMouseLeave = () => setTooltipVisible(false);

    async function generateGraph() {
        try {
            setIsGeneratingGraph(true);
            const payload = {
                sources: checkedSources.map(source => ({ file_type: source.file_type, source_path: source.source_path, category: Array.isArray(source.category) ? source.category.filter(cat => cat !== "all")[0] : source.category })),
                selectedOptions: ["graph"],
                inputContext: context,
                title
            };
            let { entities, title } = await makeApiRequest('/gen-metadata', 'post', payload);

            setSelectedJsonEntity({ title, entities });
            setJsonEntities(prev => [...prev, { title, entities }]);
            setShowGraphModal(true);
        } catch (error) {
            console.log(error);
        } finally {
            setIsGeneratingGraph(false);
        }
    }

    return (
        <>
            <div className='flex flex-col gap-1 h-full'>
                <div className="relative w-full">
                    <div className="flex flex-col mb-2">
                        <label className={`${theme === "dark" ? 'text-textColor-100' : 'text-textColor-200'} font-medium`}>Context prompt</label>
                        <span className={`${theme === "dark" ? 'text-textColor-100' : 'text-textColor-200'} text-sm`}>
                            {/* (Optional) Provide additional context or instructions to guide the JSON generation process. This can include specific themes, styles, or elements you want to see in the generated content. */}
                            Constrain model behavior through schema-based contextual configuration.
                        </span>
                    </div>
                    <textarea
                        className={`w-full p-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-200/50 rounded-md text-textColor-200" : '!border !border-textColor-100 text-textColor-300'} rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        rows="3"
                        placeholder='Customize your JSON structure'
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                    />
                </div>
                <div className="relative w-full mb-2">
                    <label className={`${theme === "dark" ? 'text-textColor-100' : 'text-textColor-200'} font-medium mb-1`}>Your entities title (optional)</label>
                    <input
                        className={`${theme === 'dark' && 'text-textColor-100'
                            } font-medium p-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-200/50 rounded-md" : '!border !border-textColor-100'} focus:outline-none w-full focus:ring-2 focus:ring-blue-500`}
                        placeholder="Write a title for the entities"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                {/* generate button */}
                <div className='relative inline-block' onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}>

                    <RippleButton
                        onClick={generateGraph}
                        fullWidth
                        cssClasses='flex items-center gap-1 disabled:cursor-not-allowed p-2'
                        disabled={isGeneratingGraph || checkedSourcesCount === 0 || checkedSourcesCount > MAX_SOURCES_COUNT}>
                        {isGeneratingGraph ? <><AutoAwesomeIcon color="white" className="animate-customPulse" /> <span className="animate-customPulse">Generating...</span></> : 'Generate'}
                    </RippleButton>

                    {/* tooltip */}
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

                {/* list of JSON structures */}
                <div className="flex flex-col mt-4 mb-2 gap-2 h-full overflow-hidden">
                    <JsonEntitiesList />
                </div>
            </div>

            {showGraphModal && <JsonEntityModal show={showGraphModal} onHide={() => setShowGraphModal(false)} />}
        </>
    );
}

export default KnowledgeGraph;