import { useContext, useEffect, useState } from 'react';
import MetadataAdvancedParams from '../MetadataAdvancedParams';
import MetadataOptions from "../MetadataOptions";
import { MainContext } from '../../contexts/mainContext';
import toast from 'react-simple-toasts';


const options = [
    { id: "summary", name: "Summary", description: "Generate a concise video overview" },
    { id: "highlights", name: "Highlights", description: "Capture key moments from the video" },
    { id: "chapters", name: "Chapters", description: "Divide video into meaningful sections" },
    { id: "faqs", name: "FAQs", description: "Frequently asked questions" },
    { id: "keywords", name: "Keywords", description: "Extract important terms from the video" },
    { id: "knowledgeGraph", name: "Knowledge graph", description: "Visualize key concepts and relationships" },
    { id: "embeddings", name: "Embeddings", description: "Create vector representations for search" },
];

function MetadataGen() {
    const { knowledgeBase, theme } = useContext(MainContext);

    const [selectedOptions, setSelectedOptions] = useState([options[0]]);

    const [temperatureValue, setTemperatureValue] = useState(0.2);
    function handleTemperatureChange(e) {
        setTemperatureValue(e.target.value);
    }

    const [verbosityValue, setVerbosityValue] = useState('low');

    function handleChange(event) {
        setVerbosityValue(event.target.value);
    }

    const [isKnowledgeBaseEmpty, setIsKnowledgeBaseEmpty] = useState(knowledgeBase.every(kb => kb.is_selected === false));

    useEffect(() => {
        setIsKnowledgeBaseEmpty(knowledgeBase.every(kb => kb.is_selected === false));
    }, [knowledgeBase]);

    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left - 60,
            y: e.clientY - rect.top + 10,
        });
    };

    const handleMouseEnter = () => isKnowledgeBaseEmpty && setTooltipVisible(true);
    const handleMouseLeave = () => setTooltipVisible(false);

    function generateMetadata() {
        if (isKnowledgeBaseEmpty) {
            toast('You must select some sources to generate metadata');
        }
        else if (selectedOptions.length === 0) {
            toast('You must select at least one metadata option');
        }
        else {
            console.log({ selectedOptions: selectedOptions.map(op => op.id), verbosityValue, temperatureValue });
        }
    }


    return (
        <div className='z-20 flex flex-col gap-4'>
            <MetadataOptions selectedOptions={selectedOptions} setSelectedOptions={setSelectedOptions} options={options} />
            <MetadataAdvancedParams temperatureValue={temperatureValue}
                setTemperatureValue={setTemperatureValue}
                handleTemperatureChange={handleTemperatureChange}
                verbosityValue={verbosityValue}
                setVerbosityValue={setVerbosityValue}
                handleChange={handleChange} />

            {/* generate button */}
            <div className='relative inline-block' onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}>
                <button className='relative w-full max-w-full py-2 m-auto text-center text-white rounded-md cursor-not-allowed disabled:opacity-50 bg-primary-300/85 hover:bg-primary-300'
                    disabled={isKnowledgeBaseEmpty} onClick={generateMetadata}>
                    Generate
                </button>
                {tooltipVisible && (
                    <p
                        // onMouseEnter={() => setTooltipVisible(false)}
                        className={`absolute p-2 text-sm font-semibold rounded shadow-2xl bg-background_workspace top-full ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}
                        style={{ top: position.y, left: position.x, opacity: tooltipVisible ? 1 : 0 }}
                    >
                        No source is selected.
                    </p>
                )}
            </div>
        </div>
    );
}

export default MetadataGen;