import Modal from 'react-bootstrap/Modal';
import './image_modal.css';

export function ImageModal(props) {

    const handleClose = () => {
        props.onHide();
    };

    return (
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
                    Generated Image
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {<img className='modal-image' src={props.imageURL} alt='Image is Loading ...' />}
            </Modal.Body>
        </Modal>
    );
}

export default ImageModal;