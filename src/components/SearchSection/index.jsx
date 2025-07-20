import { useState, useEffect, useContext } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import axios from 'axios';
import { MainContext } from '../../contexts/mainContext';
import CustomInput from '../CustomInput';
import CustomButton from '../CustomButton';
import BaseHeading from '../BaseHeading';
import toast from 'react-simple-toasts';
import { timeToSeconds } from '../../utils';
import RippleButton from '../RippleButton';
import AnimatedInput from '../AnimatedInput';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

const SearchSection = ({ chatLoaded, className = '', isGlobalSearch = true, fromMetadata = false }) => {

    const { currentResource, setCurrentResource, resourceURL, setResourceURL, player, isPlayerReady,
        selectedCategory, selectedFormat,
        setAdditionalSources,
        setShowSearchModal,
        setSummary,
        setActiveView,
        activeView,
        setJumpToPage
    } = useContext(MainContext);

    const [, setFromChat] = useState(false);
    const [selectedCategoryChat] = useState('all');
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
            const response = await axios.post(`${API_ENDPOINT}/process-query`, { selectedCategory, searchQuestion, currentResource: isGlobalSearch ? null : currentResource, selectedFormat });
            if (response.status === 200) {
                let resourceURL = '';
                let timestamp;
                if (response.data.file_type == 'video') {
                    resourceURL = `${API_ENDPOINT}/video/all/${encodeURIComponent(response.data.source_path)}`;
                    timestamp = response.data.timestamp;
                }
                else if (response.data.file_type == 'pdf') {
                    resourceURL = `${API_ENDPOINT}/pdf/${selectedCategoryChat}/${encodeURIComponent(response.data.source_path)}`;
                }
                else if (response.data.file_type == 'img') {
                    resourceURL = `${API_ENDPOINT}/img/${selectedCategoryChat}/${encodeURIComponent(response.data.source_path)}`;
                }
                setCurrentResource(response.data);
                setResourceURL(resourceURL);
                // setActiveView('resource');
                setIsSearching(false);
                // response.data.file_type === 'img' ? setSummary(response.data.caption) : setSummary(response.data.summary);
                setSummary(response.data.summary);
                if (isPlayerReady) player?.current?.seekTo(typeof timestamp === "number" ? timestamp : timeToSeconds(timestamp));
                setAdditionalSources(response.data.additional_sources);
                // if (activeView !== 'resource') {
                if (!fromMetadata) { setShowSearchModal(true); }
                // }

                if (response.data.file_type === "pdf") {
                    setJumpToPage({ page: response.data.page });
                }
            }
        } catch (error) {
            console.log(error);
            toast('An error occurred while searching');
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchQuestionChange = (event) => {
        setSearchQuestion(event.target.value);
    };

    return (
        <div className={`search-wrapper ${className}`}>
            {
                chatLoaded ?
                    (
                        <div className="flex items-end gap-2">
                            {/* <CustomInput className="z-[51]" placeholder={isGlobalSearch ? "Search in all sources" : "Search in current source"} value={searchQuestion} onChange={handleSearchQuestionChange} onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSubmitQuestion(e);
                                }
                            }} /> */}
                            <AnimatedInput disabled={false} label={isGlobalSearch ? "Search in all sources" : "Search in current source"} value={searchQuestion} setValue={setSearchQuestion} onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSubmitQuestion(e);
                                }
                            }} />
                            <RippleButton onClick={handleSubmitQuestion} cssClasses='!px-3'>
                                {isSearching ? <span className='tracking-wide loader-ghost'>Searching...</span> : isGlobalSearch ? 'Discover' : 'Search'}
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