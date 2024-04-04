import { useContext, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import VideoThumbnail from '../VideoThumbnail';
import PDFThumbnail from '../PDFThumbnail';
import ImageThumbnail from '../ImageThumbnail';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LoadingSpinner from '../LoadingSpinner';
import Checkbox from '@mui/material/Checkbox';

import OverlayTrigger from "react-bootstrap/OverlayTrigger";

import './source_explorer.css';
import { MainContext } from '../../contexts/mainContext';
import Tooltip from "react-bootstrap/Tooltip";
import CustomTooltip from '../CustomTooltip';

export function SourceExplorer(props) {

    const {
        selectedAll, setSelectedFormat,
        selectedFormat, selectedCategory, setSelectedCategory } = useContext(MainContext);

    // const [currentPath, setCurrentPath] = useState('/');
    const [viewModes, setViewModes] = useState(['categories']); // 'categories' or 'formats'

    const [history, setHistory] = useState(['/']);
    const currentPath = history[history.length - 1] || '/';

    useEffect(() => {
        // update current path whenever selectedCategory changes in Parent component
        if (selectedCategory !== null && !props.isOpenedFromSourceExplorerBtn) {
            setViewModes(prevViewModes => [...prevViewModes, 'formats']);
            setHistory([`/${selectedCategory}/`]);
        }

    }, [selectedCategory]);


    const handleClose = () => {
        setHistory(['/']);
        setViewModes(['categories']);
        props.onHide();
    };


    const openCategoryFolder = (category) => {
        setSelectedCategory(category);
        const newPath = currentPath + category + '/';
        setViewModes(prevViewModes => [...prevViewModes, 'formats']);
        setHistory(prevHistory => [...prevHistory, newPath]);
    };


    const openFormatFolder = (format) => {
        setSelectedFormat(format);
        const newPath = currentPath + format + '/';
        setViewModes(prevViewModes => [...prevViewModes, 'files']);
        setHistory(prevHistory => [...prevHistory, newPath]);
    };


    const goBack = () => {
        setHistory(prevHistory => {
            const newHistory = [...prevHistory];
            newHistory.pop();
            return newHistory;
        });
        setViewModes(prevViewModes => {
            const newViewModes = [...prevViewModes];
            newViewModes.pop();
            return newViewModes;
        });
    };


    const BackButton = () => (
        currentPath !== '/' && (
            <button onClick={goBack} className="back-btn">
                <ArrowBackIcon />
            </button>
        )
    );

    const renderFolders = () => {
        if (viewModes[viewModes.length - 1] === 'categories') {
            return props.categories.map((item, index) => (
                <div className='folder' onClick={() => openCategoryFolder(item.value)} key={index}>
                    <FolderIcon sx={{ fontSize: 60 }} />
                    <p>{item.label}</p>
                </div>
            ));
        } else if (viewModes[viewModes.length - 1] === 'formats') {
            return props.formats.map((item, index) => (
                <div className='folder' onClick={() => openFormatFolder(item.value)} key={index}>
                    <FolderIcon sx={{ fontSize: 60 }} />
                    <p>{item.label}</p>
                </div>
            ));
        }
    };

    // const renderTooltip = (props) => (
    //     <Tooltip className='tooltip' {...props}>{}</Tooltip>
    // );


    const renderFiles = () => {
        if (viewModes[viewModes.length - 1] === 'files') {
            // Extracts category and format from the currentPath
            const pathSegments = currentPath.split('/').filter(Boolean); // Removes empty strings from array
            const category = pathSegments[0];
            const format = pathSegments[1];

            if (category === 'all') {
                return props.knowledgeBase
                    .filter(file => (file.file_type === format) || (format === 'all'))
                    .map((file, index) => (
                        // turn them into component (SourceExplorerThumbnail)
                        // <OverlayTrigger key={index} className='tooltip' placement="right" overlay={() => renderTooltip(file.source_path)}>
                        // <CustomTooltip text={file.source_path} key={index}>
                        <div className='border rounded-md thumbnail-container file' key={index}>
                            {props.isDeleting && props.clickedIndex === index && <div className='thumbnail-loader'><LoadingSpinner /></div>}
                            <div className="relative">
                                <Checkbox
                                    className='absolute p-0 source-checkbox'
                                    checked={file.is_selected}
                                    onChange={() => props.handleCheckboxChange(file)}
                                    inputProps={{ 'aria-label': 'Select source' }}
                                />
                                <div onClick={event => props.onThumbnailClick(event, file)}>
                                    {file.file_type === 'video' && <VideoThumbnail item={file} />}
                                    {file.file_type === 'pdf' && <PDFThumbnail item={file} />}
                                    {file.file_type === 'img' && <ImageThumbnail item={file} />}
                                </div>
                                <DeleteIcon color='error' onClick={event => props.deleteResource(event, index)} className='absolute top-0 right-0 delete-icon' />
                            </div>
                            {/* <p>{file.source_path}</p> */}
                        </div>
                        // </CustomTooltip>
                        // </OverlayTrigger>
                    ));
            }
            else {
                return props.knowledgeBase
                    .filter(file => ((file.file_type === format || format === 'all') && (file.category[1] === category)))
                    .map((file, index) => (
                        // turn them into component (SourceExplorerThumbnail)
                        <div className='border rounded-md thumbnail-container file' key={index}>
                            {props.isDeleting && props.clickedIndex === index && <div className='thumbnail-loader'><LoadingSpinner /></div>}
                            <div className="relative">
                                <Checkbox
                                    className='absolute p-0 source-checkbox'
                                    checked={file.is_selected}
                                    onChange={() => props.handleCheckboxChange(file)}
                                    inputProps={{ 'aria-label': 'Select source' }}
                                />
                                <div onClick={event => props.onThumbnailClick(event, file)}>
                                    {file.file_type === 'video' && <VideoThumbnail item={file} />}
                                    {file.file_type === 'pdf' && <PDFThumbnail item={file} />}
                                    {file.file_type === 'img' && <ImageThumbnail item={file} />}
                                </div>
                                <DeleteIcon color='error' onClick={event => props.deleteResource(event, index)} className='absolute top-0 right-0 delete-icon' />
                            </div>
                            {/* <p>{file.source_path}</p> */}
                        </div>
                    ));
            }
        }
    };

    return (
        <Modal
            {...props}
            onHide={handleClose}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            className="file-explorer-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Source Explorer
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='current-path-wrapper'>
                    <BackButton className='back-btn' />
                    <h3 className='current-path'>{currentPath}</h3>
                </div>
                <div className='flex flex-wrap items-center gap-10 folders-wrapper'>
                    {viewModes[viewModes.length - 1] !== 'files' ? renderFolders() : renderFiles()}
                </div>
                <Checkbox
                    className='select-all-checkbox'
                    checked={selectedAll}
                    onChange={() => props.handleSelectAllCheckboxChange()}
                    inputProps={{ 'aria-label': 'Select All Sources' }}
                    label="Select All Sources"
                />
            </Modal.Body>
        </Modal>
    );
}

export default SourceExplorer;