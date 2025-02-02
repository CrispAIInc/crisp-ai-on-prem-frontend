import { useContext, useEffect, useState } from 'react';
import MetadataAdvancedParams from '../MetadataAdvancedParams';
import MetadataOptions from "../MetadataOptions";
import { MainContext } from '../../contexts/mainContext';
import toast from 'react-simple-toasts';
import LoadingSpinner from '../LoadingSpinner';
import AddToKnowledgeBaseModal from '../AddToKnowledgeBaseModal';
import makeApiRequest from '../../api';
import SelectedSourcesDropdown from '../SelectedSourcesDropdown';




function MetadataGen() {
    const { knowledgeBase, theme, selectedCategory, setKnowledgeBase, categoryOptions, selectedOptions, setSelectedOptions, setGeneratedResources, sourcesTobeCommited, setSourcesTobeCommited, metadataOptions } = useContext(MainContext);

    // const [selectedOptions, setSelectedOptions] = useState([metadataOptions[0]]);

    const [selectedSourcesToGen, setSelectedSourcesToGen] = useState(sourcesTobeCommited?.length > 0 ? [sourcesTobeCommited[0]] : []);

    useEffect(() => {
        // setSelectedSourcesToGen(sourcesTobeCommited?.length > 0 ? [sourcesTobeCommited[0]] : []);
        setSelectedSourcesToGen(prev => {
            return prev.filter(item => sourcesTobeCommited.find(s => s.source_path === item.source_path));
        });
    }, [sourcesTobeCommited]);

    const [temperatureValue, setTemperatureValue] = useState(0.2);
    function handleTemperatureChange(e) {
        setTemperatureValue(e.target.value);
    }

    const [verbosityValue, setVerbosityValue] = useState('low');

    function handleChange(event) {
        setVerbosityValue(event.target.value);
    }

    const [isLoading, setIsLoading] = useState(false);

    // const [isKnowledgeBaseEmpty, setIsKnowledgeBaseEmpty] = useState(knowledgeBase.every(kb => kb.is_selected === false));

    const [isModalVisible, setIsModalVisible] = useState(false);

    // useEffect(() => {
    //     setIsKnowledgeBaseEmpty(knowledgeBase.every(kb => kb.is_selected === false));
    // }, [knowledgeBase]);

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

    async function generateMetadata() {
        setIsLoading(true);
        // if (isKnowledgeBaseEmpty) {
        //     toast('You must select some sources to generate metadata');
        // }
        if (selectedOptions.length === 0) {
            toast('You must select at least one metadata option');
        }

        else if (selectedSourcesToGen.length === 0) {
            toast('You must select at least one source');
        }

        const categoryValues = categoryOptions.map((option) => option.value);

        try {
            // const payload = {
            //     category: selectedCategory, sources: knowledgeBase.filter(kb => kb.is_selected).map(kb => ({ file_type: kb.file_type, source_path: kb.source_path })), selectedOptions: selectedOptions.map(op => op.id), verbosityValue, temperatureValue
            // };
            const payload = {
                category: selectedCategory, sources: selectedSourcesToGen.map(source => ({ file_type: source.file_type, source_path: source.source_path })), selectedOptions: selectedOptions.map(op => op.id), verbosityValue, temperatureValue
            };
            setSourcesTobeCommited(knowledgeBase.filter(kb => kb.is_selected));
            let { results } = await makeApiRequest('/gen-metadata', 'post', payload);
            // update content in /content
            // ... /content
            const data = await makeApiRequest(
                "/content",
                "post",
                JSON.stringify(categoryValues)
            );

            //TODO: whenever you see `sourcesTobeCommited`, change that with selectedSourcesToGen, because we now only work with the selected sources and not all sources in the selected sources section
            let updatedKnowledgeBase = data.map(item => {
                let selected = sourcesTobeCommited.find(s => s.source_path === item.source_path);

                if (selected) {
                    return { ...item, is_selected: true };
                } else {
                    return item;
                }
            });

            setKnowledgeBase(updatedKnowledgeBase);

            // setKnowledgeBase((prev) => {
            //     const updatedKnowledgeBase = prev.map((kb) => {
            //         const updatedKb = data.find((d) => d.source_path === kb.source_path);
            //         if (updatedKb) {
            //             return { ...updatedKb, ...kb };
            //         }
            //         return kb;
            //     });
            //     return updatedKnowledgeBase;
            // });
            // setKnowledgeBase(data);
            setGeneratedResources(results);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
            if (selectedOptions.find(op => op.id === 'embeddings') && selectedSourcesToGen.length !== 0) {
                setIsModalVisible(true);
            }
            // if (generatedResources.every(gr => gr.embeddings_generated === false)) {
            //     setIsModalVisible(true);
            // }
        }
    }


    return (
        <div className='z-20 flex flex-col gap-4'>
            <MetadataOptions selectedOptions={selectedOptions} setSelectedOptions={setSelectedOptions} options={metadataOptions} />
            <SelectedSourcesDropdown selectedOptions={selectedSourcesToGen} setSelectedOptions={setSelectedSourcesToGen} options={sourcesTobeCommited} />
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
                <button className='relative flex items-center justify-center w-full max-w-full gap-2 py-2 m-auto text-center text-white rounded-md cursor-not-allowed disabled:opacity-50 bg-primary-300/85 hover:bg-primary-300'
                    disabled={selectedSourcesToGen.length === 0 || isLoading} onClick={generateMetadata}>
                    {isLoading ? <><LoadingSpinner isSmall /> Generating...</> : 'Generate'}
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

            {/* modal to add sources to current KB*/}
            <AddToKnowledgeBaseModal show={isModalVisible} onHide={() => setIsModalVisible(false)} />
        </div>
    );
}

export default MetadataGen;