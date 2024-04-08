import { useContext, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import DeleteIcon from '@mui/icons-material/Delete';
import VideoThumbnail from '../VideoThumbnail';
import PDFThumbnail from '../PDFThumbnail';
import ImageThumbnail from '../ImageThumbnail';
import LoadingSpinner from '../LoadingSpinner';
import Checkbox from '@mui/material/Checkbox';

// import './search_modal.css';
import { MainContext } from '../../contexts/mainContext';

export function SearchModal(props) {

    const { additionalSources } = useContext(MainContext);

    const handleClose = () => {
        props.onHide();
    };

    // Function to filter knowledgeBase items whose source paths exist in additionalSources
    const filteredKnowledgeBase = props.knowledgeBase.filter(kbItem =>
        additionalSources.some(addSrc => addSrc === kbItem.source_path)
    );

    return (
        <>
            <Modal
                {...props}
                onHide={handleClose}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                scrollable={true}
                centered
                className="search-results-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Search Results
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="thumbnails">
                        {filteredKnowledgeBase.map((item, index) => (
                            <div className='thumbnail-container' key={index}>
                                {props.isDeleting && props.clickedIndex === index ?
                                    <div className='thumbnail-loader'><LoadingSpinner /></div> : null}
                                <Checkbox
                                    className='source-checkbox'
                                    checked={item.is_selected}
                                    onChange={() => props.handleCheckboxChange(item)}
                                    inputProps={{ 'aria-label': 'Select source' }}
                                />
                                <div onClick={event => props.onThumbnailClick(event, item)}>
                                    {item.file_type === 'video' && <VideoThumbnail item={item} />}
                                    {item.file_type === 'pdf' && <PDFThumbnail item={item} />}
                                    {item.file_type === 'img' && <ImageThumbnail item={item} />}
                                </div>
                                <DeleteIcon onClick={event => props.deleteResource(event, index)} className='delete-icon' />
                            </div>
                        ))}
                    </div>

                </Modal.Body>
            </Modal>
        </>
    );
}

export default SearchModal;