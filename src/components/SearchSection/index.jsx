import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { MainContext } from '../../contexts/mainContext.jsx';
import BaseHeading from '../BaseHeading';
import toast from 'react-simple-toasts';
import { timeToSeconds } from '../../utils';
import RippleButton from '../RippleButton';
import AnimatedText from '../AnimatedText';
import makeApiRequest from '../../api/index.js';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

const SearchSection = ({ chatLoaded, className = '', isGlobalSearch = true, fromMetadata = false }) => {

    const { currentResource, setCurrentResource, resourceURL, setResourceURL, player, isPlayerReady,
        selectedCategory, selectedFormat,
        setAdditionalSources,
        setShowSearchModal,
        setSummary,
        theme,
        setJumpToPage
    } = useContext(MainContext);

    const [, setFromChat] = useState(false);
    // const [selectedCategory] = useState('all');
    const [searchQuestion, setSearchQuestion] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (isPlayerReady && resourceURL && currentResource.file_type === 'video') {
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
            const response = await makeApiRequest('/process-query', 'POST', JSON.stringify({
                selectedCategory,
                searchQuestion,
                currentResource: isGlobalSearch ? null : currentResource,
                selectedFormat
            })
            );
            // const response = await axios.post(`${API_ENDPOINT}/process-query`, { selectedCategory, searchQuestion, currentResource: isGlobalSearch ? null : currentResource, selectedFormat });
            // if (response.status === 200) {
            let resourceURL = '';
            let timestamp;
            if (response.file_type == 'video') {
                resourceURL = `${API_ENDPOINT}/video/all/${encodeURIComponent(response.source_path)}`;
                timestamp = response.timestamp;
            }
            else if (response.file_type == 'pdf') {
                resourceURL = `${API_ENDPOINT}/pdf/${selectedCategory}/${encodeURIComponent(response.source_path)}`;
            }
            else if (response.file_type == 'img') {
                resourceURL = `${API_ENDPOINT}/img/${selectedCategory}/${encodeURIComponent(response.source_path)}`;
            }
            setCurrentResource(response);
            setResourceURL(resourceURL);
            // setActiveView('resource');

            // response.file_type === 'img' ? setSummary(response.caption) : setSummary(response.summary);
            setSummary(response.summary);
            if (isPlayerReady) player?.current?.seekTo(typeof timestamp === "number" ? timestamp : timeToSeconds(timestamp));
            setAdditionalSources(response.additional_sources);
            // if (activeView !== 'resource') {
            if (!fromMetadata) {
                setShowSearchModal(true);
            }
            // }

            if (response.file_type === "pdf") {
                setJumpToPage({ page: response.page });
            }
            // }
        } catch (error) {
            console.log(error);
            toast('An error occurred while searching');
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className={`search-wrapper ${className}`}>
            {
                chatLoaded ?
                    (
                        <div className={`flex items-center pr-[1px] bg-background_workspace ${theme === 'light' ? '!border !border-textColor-100' : '!border !border-textColor-300'} rounded-full bg-transparent`}>

                            <input className='flex-1 p-2 bg-transparent border-none rounded-full outline-none' placeholder={isGlobalSearch ? "Search in all sources" : "Search in current source"} value={searchQuestion} onChange={(event) => setSearchQuestion(event.target.value)} onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSubmitQuestion(e);
                                }
                            }} />

                            <RippleButton onClick={handleSubmitQuestion} cssClasses='p-2'>
                                {isSearching ? <AnimatedText text='Searching...' /> : isGlobalSearch ? 'Discover' : 'Search'}
                            </RippleButton>

                        </div>
                    ) : <div className='text-center'>
                        <BaseHeading text='Please wait for data to load...' />
                    </div>
            }
        </div>
    );
};

export default SearchSection;