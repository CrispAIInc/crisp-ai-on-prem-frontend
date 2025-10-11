import Modal from 'react-bootstrap/Modal';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext.jsx';
import FileUploaderModal from '../FileUploaderModal';
import { IndexModal } from '../IndexModal/index.jsx';

const CategoriesModal = (props) => {

    const { setSelectedCategory, theme } = useContext(MainContext);

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        props.setShowFileFormatsModal(true);
        setIsUploadModalOpen(true);
        // props.onHide();
    };

    const [isIndexModalOpen, setIsIndexModalOpen] = useState(false);
    function openIndexModal() {
        setIsIndexModalOpen(true);
        props.onHide();
    }

    function hideIndexModal() {
        setIsIndexModalOpen(false);
    }

    return (
        <>
            <Modal
                show={props.show}
                onHide={props.onHide}
                size="sm"
                aria-labelledby="contained-modal-title-vcenter"
                scrollable={true}
                centered
                dialogClassName='text-left'


            >
                <Modal.Header closeButton className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white border-b-none'}`}>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Category
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
                    {props.categoryOptions.filter(cat => cat.value !== "all").length > 0 ? <div className='flex flex-col items-start justify-start gap-3'>
                        {
                            props.categoryOptions.map(({ value, label }, index) => (
                                value !== 'all' &&
                                <div key={index} className='flex items-center justify-center gap-2 cursor-pointer' onClick={() => handleCategoryClick(value)}>
                                    <FolderOpenOutlinedIcon />
                                    <span>{label}</span>
                                </div>
                            ))
                        }
                    </div> : (
                        <div>
                            <p>No index found!</p>
                            <p onClick={openIndexModal} className="mb-1 text-primary-300 hover:border-b hover:border-b-primary-300 w-fit hover:cursor-pointer">Create new index</p>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
            <IndexModal show={isIndexModalOpen} onHide={hideIndexModal} handleUpload={props?.handleUpload} />
            {isUploadModalOpen && <FileUploaderModal handleUpload={props.handleUpload} indexName={null} show={isUploadModalOpen} hideIndexModal={props.onHide} onHide={() => setIsUploadModalOpen(false)} />}</>
    );
};

export default CategoriesModal;