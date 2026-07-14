import { useContext, useEffect, useRef, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';
import RippleButton from '../RippleButton';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import makeApiRequest from '../../api';
import JsonEntityModal from '../JsonEntityModal';
import JsonEntitiesList from '../JsonEntitiesList';
import { ProjectContext } from '../../contexts/projectContext';
import useMetadata from '../../hooks/useMetadata';
import BaseHeading from '../BaseHeading';
import SegmentDescription from '../SegmentDescription';
import PageNumbersPicker from '../PageNumbersPicker';
import { DEFAULT_TOTAL_PDF_PAGES } from '../../globals';
import { Checkbox } from '@mui/material';

function KnowledgeGraph({
    context,
    setContext,
    setOntology,
    title,
    setTitle,
    isGeneratingGraph,
    showGraphModal,
    setShowGraphModal,
    canGenerate,
    step,
    generateGraph,
    entityVideoStart,
    setEntityVideoStart,
    entityVideoEnd,
    setEntityVideoEnd,
    setEntityPageFrom,
    isFullSourceDuration,
    setIsFullSourceDuration,
    setEntityPageTo,
}) {

    const { isProjectReadOnly } = useContext(ProjectContext);

    const {
        theme,
        checkedSources,
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


    // const sourceHasMetadata = Boolean(checkedVideoSource?.metadata?.summary?.content?.length > 0 && checkedVideoSource?.metadata?.highlights?.content?.length > 0 && checkedVideoSource?.metadata?.chapters?.content?.length > 0);

    // const canGenerate = checkedSourcesCount > 0 && checkedSourcesCount <= MAX_SOURCES_COUNT && context?.trim() !== "" && !isProjectReadOnly;

    const handleMouseEnter = () => !canGenerate && setTooltipVisible(true);
    const handleMouseLeave = () => setTooltipVisible(false);



    const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);

    const fileInputRef = useRef(null);
    const [input, setInput] = useState("");
    const [formatted, setFormatted] = useState("");

    const [error, setError] = useState("");

    const formatJSON = (json) => {
        try {
            const parsed = JSON.parse(json);
            const pretty = JSON.stringify(parsed, null, 2);
            setFormatted(pretty);
            setError("");
        } catch (err) {
            setError("Invalid business schema!");
            setFormatted("");
        }
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setInput(value);
        formatJSON(value);
    };

    const handleFileUpload = (e) => {

        const file = e.target.files[0];
        if (!file) return;

        console.log("sd");
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            setInput(text);
            formatJSON(text);
        };
        reader.readAsText(file);
    };

    const handleTabClick = (e) => {
        if (e.key === "Tab") {
            e.preventDefault();

            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;

            if (e.shiftKey) {
                // Remove tab
                const before = input.substring(0, start);
                if (before.endsWith("\t")) {
                    const newValue =
                        input.substring(0, start - 1) +
                        input.substring(end);
                    setInput(newValue);

                    setTimeout(() => {
                        e.target.selectionStart = e.target.selectionEnd = start - 1;
                    }, 0);
                }
            } else {
                // Add tab
                const newValue =
                    input.substring(0, start) +
                    "\t" +
                    input.substring(end);

                setInput(newValue);

                setTimeout(() => {
                    e.target.selectionStart = e.target.selectionEnd = start + 1;
                }, 0);
            }
        }
    };

    useEffect(() => {
        setOntology(input);
    }, [input]);

    const checkedVideos = checkedSources?.filter(source => source.file_type === "video");
    const checkedPdfs = checkedSources?.filter(source => source.file_type === "pdf");
    const sourceType = checkedVideos?.length === 1 ? "video" : checkedPdfs?.length === 1 ? "pdf" : null;



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
                    <div className="relative w-full ">
                        <label className={`${theme === "dark" ? 'text-textColor-100' : 'text-textColor-200'} font-medium mb-1`}>Title (optional)</label>
                        <input
                            className={`font-medium p-2 bg-transparent !border ${theme === "dark" ? "text-textColor-100 !border !border-textColor-200/50" : '!border !border-textColor-100'} rounded-xl focus:outline-none w-full`}
                            placeholder="Write a title for the entities"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full">
                        <div className="flex flex-col ">
                            <label className={`${theme === "dark" ? 'text-textColor-100' : 'text-textColor-200'} font-medium`}>Context</label>
                        </div>
                        <input
                            className={`w-full p-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-200/50 text-textColor-200" : '!border !border-textColor-100 text-textColor-300'} rounded-xl resize-none focus:outline-none`}
                            placeholder='e.g. Travel, finance.'
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="relative flex items-center gap-1 flex-1">
                                <label className={`${theme === "dark" ? 'text-textColor-100' : 'text-textColor-200'} font-medium mb-1`}>Business Schema (optional)</label>
                                <InfoOutlinedIcon onMouseOver={() => setIsInfoTooltipOpen(true)} onMouseLeave={() => setIsInfoTooltipOpen(false)} className={`!relative !w-5 ${theme === 'dark' && 'text-textColor-100'}`} />

                                {
                                    isInfoTooltipOpen && (
                                        <div className={`absolute right-0 p-2 bg-background_workspace shadow-lg rounded-md w-[300px] max-w-[300px] left-0 z-40 top-full ${theme === 'light' ? 'text-textColor-200 !border !border-textColor-100/50' : '!border !border-textColor-300 text-textColor-100'} text-sm`}>If no business schema was provided, the generation will be based on the context.</div>
                                    )
                                }
                            </div>
                            <button className={`font-medium text-sm p-2 bg-transparent !border ${theme === "dark" ? "text-textColor-100 !border !border-textColor-200/50" : '!border !border-textColor-100'} rounded-xl focus:outline-none`}
                                onClick={() => fileInputRef.current.click()}
                            >
                                Upload
                            </button>
                            <input type="file" ref={fileInputRef} accept=".json" style={{ display: 'none' }} onChange={handleFileUpload} />
                        </div>
                        <textarea
                            value={input}
                            onChange={handleChange}
                            placeholder="Paste or type business schema here (in JSON format)..."
                            className={`w-full h-28 p-3 rounded-2xl font-mono  text-sm ${theme === 'dark' ? 'text-textColor-100 bg-gray-900' : 'text-textColor-300 bg-white !border !border-textColor-100/80'} outline-none resize-none`}
                            onKeyDown={handleTabClick}
                        />

                        {/* Error */}
                        {(error && input.trim().length > 0) && (
                            <BaseHeading className="!text-red-500 font-medium" text={error} />
                        )}
                    </div>
                    <div className="flex items-center">
                        <Checkbox
                            sx={{ p: 0 }}
                            onChange={(e) => setIsFullSourceDuration(e.target.checked)}
                            inputProps={{ "aria-label": "Select All Sources" }}
                            label="Include full source"
                            className={`${theme === "dark" && "border-textColor-100 !text-textColor-100"}`}
                        />

                        <BaseHeading
                            text="Include full source length"
                            className={`${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                }`}
                        />
                    </div>
                    {
                        !isFullSourceDuration && (
                            <>
                                {
                                    sourceType === "video" ? (
                                        <SegmentDescription
                                            start={entityVideoStart}
                                            setStart={setEntityVideoStart}
                                            end={entityVideoEnd}
                                            setEnd={setEntityVideoEnd}
                                            isDisabled={isFullSourceDuration}
                                        // handleGenerate={handleGenerateSegmentDescription}
                                        />
                                    ) : sourceType === "pdf" ? (
                                        <div>
                                            <BaseHeading text={`Source: ${checkedPdfs[0]?.source_path}`} />
                                            <PageNumbersPicker
                                                totalPages={checkedPdfs[0]?.total_pages || DEFAULT_TOTAL_PDF_PAGES}
                                                setStart={setEntityPageFrom}
                                                setEnd={setEntityPageTo}
                                                isDisabled={isFullSourceDuration}
                                            />
                                        </div>
                                    ) : null
                                }
                            </>
                        )
                    }


                    {/* generate button */}
                    <div className={`relative inline-block`} onMouseMove={handleMouseMove}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}>

                        <RippleButton
                            onClick={generateGraph}
                            fullWidth
                            cssClasses='flex items-center mt-2 gap-1 disabled:cursor-not-allowed p-2'
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
                <div className="flex flex-col mt-2  gap-2 h-full overflow-hidden">
                    <JsonEntitiesList />
                </div>
            </div>

            {showGraphModal && <JsonEntityModal show={showGraphModal} onHide={() => setShowGraphModal(false)} />}
        </>
    );
}

export default KnowledgeGraph;