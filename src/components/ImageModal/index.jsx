import Modal from 'react-bootstrap/Modal';
import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

export function ImageModal(props) {

    const { theme } = useContext(MainContext);

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
            className="h-full search-results-modal"
        >
            <Modal.Header closeButton className={`${theme === "light" ? "" : "bg-textColor-300 text-white !border-b-textColor-200"
                }`}>
                <Modal.Title id="contained-modal-title-vcenter">
                    <h2 className={`${theme === 'light' ? 'text-textColor-200' : 'text-textColor-200'}`}>Generated Image</h2>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className={`${theme === "light" ? "" : "bg-textColor-300 text-white"} overflow-hidden`}>
                {<img className='object-fill h-full mx-auto l' src={props.imageURL} alt='Image is Loading ...' />}
            </Modal.Body>
        </Modal>
    );
}

export default ImageModal;