import { useState, useEffect, useContext } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import axios from 'axios';
import { MainContext } from '../../contexts/mainContext';
import CustomInput from '../CustomInput';
import CustomButton from '../CustomButton';
import BaseHeading from '../BaseHeading';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

const SearchSection = ({ chatLoaded }) => {

    const { currentResource, setCurrentResource, resourceURL, setResourceURL, player, isPlayerReady,
        selectedCategory, selectedFormat,
        setAdditionalSources,
        setShowSearchModal,
        setSummary,
    } = useContext(MainContext);

    const [fromChat, setFromChat] = useState(false);
    const [selectedCategoryChat] = useState('all');
    const [searchQuestion, setSearchQuestion] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (isPlayerReady && resourceURL && currentResource.file_type === 'video') {
            const timestamp = currentResource.timestamp; // Make sure you have the timestamp here
            console.log("timestamp", timestamp);
            console.log("timestamp to seconds", timestamp);
            if (timestamp) player.current.seekTo(timestamp);
            else;
            setFromChat(false);
        }
    }, [isPlayerReady]);

    const handleSubmitQuestion = async (event) => {
        event.preventDefault();
        setIsSearching(true);
        try {
            const response = await axios.post(`${API_ENDPOINT}/process-query`, { selectedCategory, searchQuestion, currentResource, selectedFormat });
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
                setIsSearching(false);
                response.data.file_type === 'img' ? setSummary(response.data.caption) : setSummary(response.data.summary);
                if (isPlayerReady) player.current.seekTo(timestamp);
                setAdditionalSources(response.data.additional_sources);
                setShowSearchModal(true);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const timeToSeconds = (time) => {
        const parts = time.split(':');
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        const seconds = parseInt(parts[2], 10);

        return hours * 3600 + minutes * 60 + seconds;
    };

    const handleSearchQuestionChange = (event) => {
        setSearchQuestion(event.target.value);
    };

    return (
        <div className='search-wrapper 2xl:w-3/6 2xl:mx-auto'>
            <div>
                {
                    chatLoaded ?
                        (
                            <>
                                <CustomInput placeholder='Search for a source by asking questions' value={searchQuestion} onChange={handleSearchQuestionChange} onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSubmitQuestion(e);
                                    }
                                }} />
                                <CustomButton disabled={chatLoaded} onClick={handleSubmitQuestion} className='w-full text-white bg-primary-300'>
                                    {isSearching ? <LoadingSpinner videoSpinner={true} /> : 'Search'}
                                </CustomButton>
                            </>
                        ) : <div className='text-center'>
                            <BaseHeading text='Please wait for data to load...' />
                        </div>
                }
            </div>
        </div>
    );
};

export default SearchSection;