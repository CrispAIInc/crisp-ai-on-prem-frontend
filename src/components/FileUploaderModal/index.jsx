import { useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import { MainContext } from '../../contexts/mainContext';
import FileUploader from '../FileUploader';

export default function FileUploaderModal({ show, onHide, hideIndexModal }) {

    const { theme } = useContext(MainContext);

    function uploadSources() {
        onHide();
        hideIndexModal();
    }

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            className=""
        >
            <Modal.Body className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
                <FileUploader />
            </Modal.Body>
            <Modal.Footer className={`${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
                <div
                    className={`flex items-center justify-center gap-2  rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={uploadSources}
                >
                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Upload</span>
                </div>
            </Modal.Footer>
        </Modal>
    );
}
