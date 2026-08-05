import { useState, useContext, useRef, useEffect } from 'react';
import { MainContext } from '../../contexts/mainContext.jsx';
import { useToast } from "../../contexts/toastContext";
import RippleButton from '../RippleButton';
import AnimatedText from '../AnimatedText';
import makeApiRequest from '../../api/index.js';
import AppSelect from "../AppSelect";


const SearchSection = ({ className = '', isGlobalSearch = true, fromMetadata = false }) => {

    const { currentResource,
        selectedCategory,
        selectedFormat,
        categoryOptionsWithoutAll,
        setDiscoveredSources,
        setShowSearchModal,
        theme,
        knowledgeBase
    } = useContext(MainContext);

    const { notify } = useToast();

    const [searchQuestion, setSearchQuestion] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [selectedDiscoveryIndexes, setSelectedDiscoveryIndexes] = useState([]);
    const textareaRef = useRef(null);

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;

        // Reset height to recalc
        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
    }, [searchQuestion]);

    const handleSubmitQuestion = async (event) => {
        event.preventDefault();
        setIsSearching(true);
        try {
            const { additional_sources, score, timestamp, page, message, success, ...rest } = await makeApiRequest('/process-query', 'POST', JSON.stringify({
                selectedCategory,
                searchQuestion,
                currentResource: isGlobalSearch ? null : currentResource,
                selectedFormat,
                indexes: selectedDiscoveryIndexes
            })
            );

            if (!success) {
                throw new Error(message);
            }
            const source = knowledgeBase?.find(item => item.source_path === rest.source_path);
            setDiscoveredSources({ mainSource: { ...source, timestamp, page: Number(page), score }, additionalSources: additional_sources });
            if (!fromMetadata) {
                setShowSearchModal(true);
            }
        } catch (error) {
            console.log(error);
            notify({
                variant: "error",
                heading: "Oops!",
                subheading: error.message || "An error occured while discovering",
            });
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className={`search-wrapper ${className}`}>
            <div className={`flex flex-col pr-[2px] bg-background_workspace ${theme === 'light' ? '!border !border-textColor-100' : '!border !border-textColor-200/50'} rounded-xl bg-transparent`}>

                <textarea
                    ref={el => {
                        textareaRef.current = el;
                    }}
                    rows={2}
                    placeholder={isGlobalSearch ? "Search in all sources" : "Search in current source"}
                    value={searchQuestion}
                    onChange={(event) => setSearchQuestion(event.target.value)}
                    className={`w-full p-2 overflow-y-auto leading-6 bg-transparent outline-none resize-none text-md max-h-28 placeholder:text-neutral-400 ${theme === 'dark' ? 'text-textColor-100' : 'text-textColor-300'}`}
                />

                <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl max-w-full">
                    <AppSelect
                        options={categoryOptionsWithoutAll}
                        value={selectedDiscoveryIndexes}
                        onChange={(value) => setSelectedDiscoveryIndexes(value)}
                        multiple
                        placeholder="Select index"
                        className="flex-1 min-w-0"
                    />

                    <RippleButton disabled={isSearching || searchQuestion.trim().length === 0} onClick={handleSubmitQuestion} cssClasses='p-2 rounded-xl'>
                        {isSearching ? <AnimatedText cssClasses='text-white' text='Searching...' /> : isGlobalSearch ? 'Discover' : 'Search'}
                    </RippleButton>
                </div>
            </div>
        </div>
    );
};

export default SearchSection;