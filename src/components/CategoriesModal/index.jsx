// import Modal from 'react-bootstrap/Modal';
// import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
// import { useContext, useRef } from 'react';
// import { MainContext } from '../../contexts/mainContext';

// const CategoriesModal = (props) => {

//     const { setSelectedCategory, setSelectedFormat, theme } = useContext(MainContext);

//     const fileUploaderRef = useRef([]);

//     const handleCategoryClick = (category) => {
//         setSelectedCategory(category);
//         fileUploaderRef.current.click();
//     };

//     // const handleOnChange = (e, format) => {
//     //     setSelectedFormat(format);
//     //     props.handleupload(e, format);
//     //     props.onHide();
//     // };

//     return (
//         <Modal
//             show={props.show}
//             onHide={props.onHide}
//             size="sm"
//             aria-labelledby="contained-modal-title-vcenter"
//             scrollable={true}
//             centered
//             dialogClassName='text-left'


//         >
//             <Modal.Header closeButton className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white border-b-none'}`}>
//                 <Modal.Title id="contained-modal-title-vcenter">
//                     Category
//                 </Modal.Title>
//             </Modal.Header>
//             <Modal.Body className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
//                 <div className='flex flex-col items-start justify-start gap-3'>
//                     {
//                         props.categoryOptions.map(({ value, label }, index) => (
//                             value !== 'all' &&
//                             <div key={index} className='flex items-center justify-center gap-2 cursor-pointer' onClick={() => handleCategoryClick(value)}>
//                                 <FolderOpenOutlinedIcon />
//                                 <span>{label}</span>
//                             </div>
//                         ))
//                     }
//                 </div>
//                 {/* file input */}
//                 {/* <input
//                     type="file"
//                     accept={"image/*, video/*, application/pdf, .pdf"}
//                     multiple
//                     ref={fileUploaderRef}
//                     onChange={(e) => handleOnChange(e)}
//                     className='hidden'
//                 /> */}
//             </Modal.Body>
//         </Modal>
//     );
// };

// export default CategoriesModal;

import Modal from 'react-bootstrap/Modal';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';
import FileUploaderModal from '../FileUploaderModal';

const CategoriesModal = (props) => {

    const { setSelectedCategory, theme } = useContext(MainContext);

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        props.setShowFileFormatsModal(true);
        setIsUploadModalOpen(true);
        // props.onHide();
    };

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
                    <div className='flex flex-col items-start justify-start gap-3'>
                        {
                            props.categoryOptions.map(({ value, label }, index) => (
                                value !== 'all' &&
                                <div key={index} className='flex items-center justify-center gap-2 cursor-pointer' onClick={() => handleCategoryClick(value)}>
                                    <FolderOpenOutlinedIcon />
                                    <span>{label}</span>
                                </div>
                            ))
                        }
                    </div>
                </Modal.Body>
            </Modal>
            {isUploadModalOpen && <FileUploaderModal handleUpload={props.handleUpload} indexName={null} show={isUploadModalOpen} hideIndexModal={props.onHide} onHide={() => setIsUploadModalOpen(false)} />}</>
    );
};

export default CategoriesModal;