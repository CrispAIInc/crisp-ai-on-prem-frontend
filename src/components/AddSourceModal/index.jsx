import { useContext, useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { MainContext } from '../../contexts/mainContext.jsx';
import { IndexModal } from '../IndexModal';
import AddIcon from '@mui/icons-material/Add';
import UploadIcon from '@mui/icons-material/Upload';
import LoadingSpinner from '../LoadingSpinner';
import CategoriesModal from '../CategoriesModal';

export default function AddSourceModal(props) {

    const { theme, categoryOptions } = useContext(MainContext);

    const [showCategoriesModal, setShowCategoriesModal] = useState(false);
    const [showFileFormatsModal, setShowFileFormatsModal] = useState(false);
    // const [isUploading, setIsUploading] = useState(false);
    const [isIndexModalOpen, setIsIndexModalOpen] = useState(false);
    function openIndexModal() {
        setIsIndexModalOpen(true);
    }

    function hideIndexModal() {
        setIsIndexModalOpen(false);
    }

    const handleAddNewResource = () => {
        setShowCategoriesModal(true);
    };

    useEffect(() => {
        if (props.openCategoriesModal && props.show) {
            setShowCategoriesModal(true);
        }
    }, [props.openCategoriesModal, props.show]);

    useEffect(() => {
        if (!props.show) {
            setShowCategoriesModal(false);
            setShowFileFormatsModal(false);
            setIsIndexModalOpen(false);
        }
    }, [props.show]);

    return (
        <Modal
            show={props.show}
            onHide={props.onHide}
            size="sm"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            className="!rounded-xl note-modal"
        >
            <Modal.Header closeButton className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white !border-b-textColor-200'}`}>
                <Modal.Title id="contained-modal-title-vcenter">
                    <h5 className="!text-md">Ingest new source or index</h5>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
                <div
                    className={`source-explorer flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100/30' : 'hover:bg-light-hover-200/20'}`}
                    onClick={openIndexModal}
                >
                    <AddIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>New Index</span>

                </div>
                {categoryOptions?.filter(cat => cat.value !== "all").length > 0 && <div
                    className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100/30' : 'hover:bg-light-hover-200/20'}`}
                    onClick={handleAddNewResource}
                >
                    {props?.isUploading ? (<LoadingSpinner isSmall />) : (<UploadIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />)}
                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Ingest</span>
                </div>}
                <IndexModal show={isIndexModalOpen} onHide={hideIndexModal} handleUpload={props?.handleUpload} />
                <CategoriesModal
                    show={showCategoriesModal}
                    onHide={() => setShowCategoriesModal(false)}
                    categoryOptions={categoryOptions}
                    setShowFileFormatsModal={setShowFileFormatsModal}
                    handleUpload={props?.handleUpload}
                />
            </Modal.Body>
            {/* <Modal.Footer className={`${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
                <div
                    className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={props.onHide}
                >
                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Ok</span>
                </div>
            </Modal.Footer> */}
        </Modal>
    );
}
