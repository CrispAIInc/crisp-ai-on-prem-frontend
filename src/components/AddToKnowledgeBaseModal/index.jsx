import Modal from 'react-bootstrap/Modal';
import QuestionMarkOutlinedIcon from '@mui/icons-material/QuestionMarkOutlined';
import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

function AddToKnowledgeBaseModal({ show, onHide, sources }) {
    const { theme, commitSelectedSources, setActiveTab } = useContext(MainContext);

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            dialogClassName='text-center'
        >

            <Modal.Body className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
                <QuestionMarkOutlinedIcon style={{ fontSize: '100px', color: `${theme === 'light' ? '#5293FD' : '#5293FD'}` }} />
                <h5>Do you want to add your sources to the current knowledge base?</h5>
            </Modal.Body>
            <Modal.Footer className={`${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
                <div
                    className={`flex items-center justify-center gap-4 w-fit`}
                >
                    <button onClick={() => {
                        commitSelectedSources(sources);
                        setActiveTab('genInsights');
                        onHide();
                    }} className={`hover:text-primary-200 text-lg font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                        Yes
                    </button>
                    <button onClick={onHide} className={`hover:text-primary-200 text-lg font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                        No
                    </button>
                </div>
            </Modal.Footer>
        </Modal>
    );
}

export default AddToKnowledgeBaseModal;