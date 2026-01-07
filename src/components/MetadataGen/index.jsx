import { useContext, useEffect, useState } from 'react';
import MetadataAdvancedParams from '../MetadataAdvancedParams';
import MetadataOptions from "../MetadataOptions";
import { MainContext } from '../../contexts/mainContext.jsx';
import toast from 'react-simple-toasts';
import LoadingSpinner from '../LoadingSpinner';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddToKnowledgeBaseModal from '../AddToKnowledgeBaseModal';
import makeApiRequest from '../../api';
import RippleButton from '../RippleButton';
import useResources from '../../hooks/useResources.js';




function MetadataGen({ isGeneratingMetadata, setIsGeneratingMetadata, verbosityValue, setVerbosityValue, context, setContext }) {

    const { knowledgeBase, theme, checkedSourcesCount, setKnowledgeBase, categoryOptions, selectedOptions, setSelectedOptions, setGeneratedResources, sourcesTobeCommited, setSourcesTobeCommited, displayedSources, metadataOptions } = useContext(MainContext);

    const { categoryValuesWithoutAll } = useResources();

    const [selectedSourcesToGen, setSelectedSourcesToGen] = useState(sourcesTobeCommited?.length > 0 ? [sourcesTobeCommited[0]] : []);

    useEffect(() => {
        // setSelectedSourcesToGen(sourcesTobeCommited?.length > 0 ? [sourcesTobeCommited[0]] : []);
        setSelectedSourcesToGen(prev => {
            return prev.filter(item => sourcesTobeCommited.find(s => s.source_path === item.source_path));
        });
    }, [sourcesTobeCommited]);

    // const [temperatureValue, setTemperatureValue] = useState(0.2);
    // function handleTemperatureChange(e) {
    //     setTemperatureValue(e.target.value);
    // }



    function handleChange(event) {
        setVerbosityValue(event.target.value);
    }

    // const [isKnowledgeBaseEmpty, setIsKnowledgeBaseEmpty] = useState(knowledgeBase.every(kb => kb.is_checked === false));

    const [isModalVisible, setIsModalVisible] = useState(false);

    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const [contextFocused, setContextFocused] = useState(false);

    const isActive = contextFocused || context.length > 0;

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left - 60,
            y: e.clientY - rect.top + 10,
        });
    };

    const handleMouseEnter = () => checkedSourcesCount === 0 && setTooltipVisible(true);
    const handleMouseLeave = () => setTooltipVisible(false);

    async function generateMetadata() {
        setIsGeneratingMetadata(true);
        // if (isKnowledgeBaseEmpty) {
        //     toast('You must select some sources to generate metadata');
        // }
        // if (selectedOptions.length === 0) {
        //     toast('You must select at least one metadata option');
        // }

        if (checkedSourcesCount === 0) {
            toast('You must check at least one source');
        }

        const categoryValues = categoryOptions.map((option) => option.value);

        function getCategories(items) {
            const categories = new Set();

            items.forEach(item => {
                item.category.forEach(cat => {
                    if (cat.toLowerCase() !== "all") {
                        categories.add(cat);
                    }
                });
            });

            return Array.from(categories);
        }

        try {
            // const payload = {
            //     category: selectedCategory, sources: knowledgeBase.filter(kb => kb.is_checked).map(kb => ({ file_type: kb.file_type, source_path: kb.source_path })), selectedOptions: selectedOptions.map(op => op.id), verbosityValue, temperatureValue
            // };
            const payload = {
                sources: displayedSources.filter(item => item.is_checked).map(source => ({ file_type: source.file_type, source_path: source.source_path, category: source.category.filter(cat => cat !== "all")[0] })),
                selectedOptions: selectedOptions.map(op => op.id),
                inputContext: context,
                verbosityValue: verbosityValue
            };
            setSourcesTobeCommited(knowledgeBase.filter(kb => kb.is_checked));
            // setSourcesAfterUncheckCrispWiz(sourcesTobeCommited);
            let { results } = await makeApiRequest('/gen-metadata', 'post', payload);

            setKnowledgeBase(prev => {
                // Build a lookup map from results
                const resultsMap = new Map(
                    results.map(r => [r.source_path, r.metadata])
                );

                return prev.map(item => {
                    // If this item exists in results, update metadata
                    if (resultsMap.has(item.source_path)) {
                        return {
                            ...item,
                            metadata: resultsMap.get(item.source_path),
                        };
                    }

                    // Otherwise, leave it unchanged
                    return item;
                });
            });


            setGeneratedResources(results);
            setVerbosityValue('Medium');
            setContext('');
        } catch (error) {
            console.error(error);
        } finally {
            setIsGeneratingMetadata(false);
            if (selectedOptions.find(op => op.id === 'embeddings') && selectedSourcesToGen.length !== 0) {
                setIsModalVisible(true);
            }
        }
    }



    return (
        <div className='z-20 flex flex-col gap-2'>

            {/* context */}
            <div className="relative w-full mt-6">
                {/* <label
                    className={`absolute left-2 top-2 text-gray-500 px-1 pointer-events-none`}
                >
                    Context
                </label> */}
                <textarea
                    className={`w-full p-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-200/50 rounded-md text-textColor-200" : '!border !border-textColor-100 text-textColor-300'} rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    rows="3"
                    placeholder='Customize Metadata Generation results with context'
                    onFocus={() => setContextFocused(true)}
                    onBlur={() => setContextFocused(false)}
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                />
            </div>

            <MetadataOptions selectedOptions={selectedOptions} setSelectedOptions={setSelectedOptions} options={metadataOptions} />
            {/* <SelectedSourcesDropdown selectedOptions={selectedSourcesToGen} setSelectedOptions={setSelectedSourcesToGen} options={sourcesTobeCommited} /> */}
            <MetadataAdvancedParams
                // temperatureValue={temperatureValue}
                // setTemperatureValue={setTemperatureValue}
                // handleTemperatureChange={handleTemperatureChange}
                verbosityValue={verbosityValue}
                setVerbosityValue={setVerbosityValue}
                handleChange={handleChange} />

            {/* generate button */}
            <div className='relative inline-block' onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}>
                <RippleButton fullWidth cssClasses='flex items-center gap-1 disabled:cursor-not-allowed p-2'
                    disabled={isGeneratingMetadata || checkedSourcesCount === 0} onClick={generateMetadata}>
                    {isGeneratingMetadata ? <><AutoAwesomeIcon color="white" className="animate-customPulse" /> <span className="animate-customPulse">Generating...</span></> : 'Generate'}
                </RippleButton>
                {tooltipVisible && (
                    <p
                        // onMouseEnter={() => setTooltipVisible(false)}
                        className={`absolute p-2 text-sm font-semibold rounded shadow-2xl bg-background_workspace top-full ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}
                        style={{ top: position.y, left: position.x, opacity: tooltipVisible ? 1 : 0 }}
                    >
                        No source is checked
                    </p>
                )}
            </div>

            {/* modal to add sources to current KB*/}
            <AddToKnowledgeBaseModal sources={knowledgeBase.filter(item => {
                const sourcePaths = new Set(selectedSourcesToGen.map(item => item.source_path));
                return sourcePaths.has(item.source_path);
            })} show={isModalVisible} onHide={() => setIsModalVisible(false)} />
        </div>
    );
}

export default MetadataGen;