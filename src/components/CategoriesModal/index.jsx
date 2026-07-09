import Modal from 'react-bootstrap/Modal';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext.jsx';
import FileUploaderModal from '../FileUploaderModal';
import { IndexModal } from '../IndexModal/index.jsx';
import BaseHeading from '../BaseHeading/index.jsx';

const CategoriesModal = (props) => {

    const {
        setSelectedCategory,
        theme,
        knowledgeBase
    } = useContext(MainContext);

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
                size="md"
                aria-labelledby="contained-modal-title-vcenter"
                scrollable={true}
                centered
                dialogClassName='text-left'


            >
                <Modal.Header closeButton className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white !border-b-textColor-200'}`}>
                    <Modal.Title id="contained-modal-title-vcenter">
                        <BaseHeading text="Ingest sources" className="text-xl" />
                        <p className="text-slate-400 text-sm mt-0.5">Choose where you&apos;d like to upload your sources.</p>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
                    {props.categoryOptions.filter(cat => cat.value !== "all").length > 0 ? (
                        <div className='max-h-[55vh] overflow-y-auto w-full space-y-2'>
                            {
                                props.categoryOptions.map(({ value, label }, index) => {
                                    if (value === "all") return null;
                                    let sourcesCount = knowledgeBase.filter(item => item.category?.includes(value)).length;
                                    return (
                                        <div key={index} className={`source-explorer px-2 py-2 rounded-md cursor-pointer w-full ${theme === 'light' ? 'hover:bg-textColor-100/25' : 'hover:bg-light-hover-200/5'}`} onClick={() => handleCategoryClick(value)}>
                                            <div className="flex items-center gap-2">
                                                <FolderOpenOutlinedIcon className={`${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'} font-bold !text-2xl`} />
                                                <div className="flex flex-col">
                                                    <BaseHeading text={label} className="!text-lg !mb-0" />
                                                    <span className={`text-slate-500 text-sm mt-0.5 ${theme === 'dark' && 'font-semibold'}`}>Contains {sourcesCount} source{sourcesCount !== 1 ? 's' : ''}.</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    ) : (
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