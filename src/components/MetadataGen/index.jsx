import { useContext, useState } from 'react';
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
    const { isIngestionEnabled } = useContext(MainContext);

    const [selectedOptions, setSelectedOptions] = useState([options[0]]);

    const [temperatureValue, setTemperatureValue] = useState(0.2);
    function handleTemperatureChange(e) {
        setTemperatureValue(e.target.value);
    }

    const [verbosityValue, setVerbosityValue] = useState('low');

    function handleChange(event) {
        setVerbosityValue(event.target.value);
    }

    function generateMetadata() {
        if (!isIngestionEnabled) {
            toast('You must select some sources to generate metadata');
        }
        else {
            console.log({ selectedOptions, verbosityValue, temperatureValue });
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
            <button className='w-full max-w-full py-2 m-auto text-center text-white rounded-md bg-primary-300/85 hover:bg-primary-300' onClick={generateMetadata}>Generate</button>
        </div>
    );
}

export default MetadataGen;