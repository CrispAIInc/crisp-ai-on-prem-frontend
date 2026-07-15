import { useState, useEffect, useContext } from 'react';
import { MainContext } from '../../contexts/mainContext.jsx';
import BaseHeading from '../BaseHeading';
import { useToast } from "../../contexts/toastContext";
import { timeToSeconds } from '../../utils';
import RippleButton from '../RippleButton';
import AnimatedText from '../AnimatedText';
import makeApiRequest from '../../api/index.js';
import useReferenceLinkClick from '../../hooks/useReferenceLinkClick.js';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

const SearchSection = ({ chatLoaded, className = '', isGlobalSearch = true, fromMetadata = false }) => {

    const { currentResource, setCurrentResource, resourceURL, setResourceURL, player, isPlayerReady,
        selectedCategory, selectedFormat,
        setDiscoveredSources,
        setShowSearchModal,
        setSummary,
        theme,
        setJumpToPage,
        knowledgeBase
    } = useContext(MainContext);

    const { notify } = useToast();

    const { handleSourceLinkClick } = useReferenceLinkClick();

    const [, setFromChat] = useState(false);
    const [searchQuestion, setSearchQuestion] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (isPlayerReady && resourceURL && currentResource?.file_type === 'video') {
            const timestamp = currentResource?.timestamp; // Make sure you have the timestamp here
            if (timestamp !== undefined && timestamp !== null) player?.current?.seekTo(typeof timestamp === "number" ? timestamp : timeToSeconds(timestamp));
            else;
            setFromChat(false);
        }
    }, [isPlayerReady, currentResource, currentResource?.timestamp]);

    const handleSubmitQuestion = async (event) => {
        event.preventDefault();
        setIsSearching(true);
        try {
            const { additional_sources, timestamp, page, message, success, ...rest } = await makeApiRequest('/process-query', 'POST', JSON.stringify({
                selectedCategory,
                searchQuestion,
                currentResource: isGlobalSearch ? null : currentResource,
                selectedFormat
            })
            );

            if (!success) {
                throw new Error(message);
            }
            const source = knowledgeBase?.find(item => item.source_path === rest.source_path);

            // handleSourceLinkClick(event, { ...source, timestamp, page });

            // setCurrentResource({ ...source, timestamp });
            // setResourceURL(resourceURL);
            // setSummary(rest.summary);
            // if (isPlayerReady) player?.current?.seekTo(typeof timestamp === "number" ? timestamp : timeToSeconds(timestamp));
            setDiscoveredSources({ mainSource: { ...source, timestamp, page: Number(page) }, additionalSources: additional_sources });
            if (!fromMetadata) {
                setShowSearchModal(true);
            }

            // if (source?.file_type === "pdf") {
            //     setJumpToPage({ page });
            // }
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
            <div className={`flex items-center pr-[2px] bg-background_workspace ${theme === 'light' ? '!border !border-textColor-100' : '!border !border-textColor-200/50'} rounded-xl bg-transparent`}>

                <input className={`flex-1 p-2 bg-transparent border-none rounded-xl outline-none ${theme === 'dark' && 'text-textColor-100'}`} placeholder={isGlobalSearch ? "Search in all sources" : "Search in current source"} value={searchQuestion} onChange={(event) => setSearchQuestion(event.target.value)} onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleSubmitQuestion(e);
                    }
                }} />

                <RippleButton disabled={isSearching || searchQuestion.trim().length === 0} onClick={handleSubmitQuestion} cssClasses='p-2 rounded-xl'>
                    {isSearching ? <AnimatedText cssClasses='text-white' text='Searching...' /> : isGlobalSearch ? 'Discover' : 'Search'}
                </RippleButton>

            </div>
        </div>
    );
};

export default SearchSection;