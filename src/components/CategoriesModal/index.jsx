import Modal from 'react-bootstrap/Modal';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

const CategoriesModal = (props) => {

    const { setSelectedCategory, theme } = useContext(MainContext);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        props.setShowFileFormatsModal(true);
        props.onHide();
    };

    return (
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
    );
};

export default CategoriesModal;