import Modal from 'react-bootstrap/Modal';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';
import makeApiRequest from '../../api';
import toast from 'react-simple-toasts';
import useResources from '../../hooks/useResources';

function RemoveIndexModal({ show, onHide, index, deleteResource }) {
    const { theme, knowledgeBase, setCategoryOptions } = useContext(MainContext);

    const { getIndexes } = useResources({ setCategoryOptions });

    async function deleteIndex() {
        try {
            // remove sources before index
            const itemsToBeDeleted = knowledgeBase.filter((item) => item.category.includes(index));
            if (itemsToBeDeleted.length > 0) await deleteResource(null, itemsToBeDeleted);
            await makeApiRequest(`/remove-index`, 'post', { index: index });
            getIndexes();
            toast('Index deleted', { className: `p-2 rounded-md`, theme: theme === 'light' ? 'dark' : 'light' });
        } catch (error) {
            console.log(error.response.data.error);
            toast(error.response.data.error || 'Error deleting index', { className: `p-2 rounded-md`, theme: theme === 'light' ? 'dark' : 'light' });
        }
    }

    return (
        <Modal
            show={show}
            onHide={onHide}
            size={`md`}
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            dialogClassName='text-center'
        >

            <Modal.Body className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
                <ReportProblemIcon style={{ fontSize: '100px', color: `orange` }} />
                <h4>Are you sure you want to delete this index?</h4>
                <h6 className='text-sm font-bold'>CAUTION: all sources from this category will be permanently deleted.</h6>
            </Modal.Body>
            <Modal.Footer className={`${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
                <div
                    className={`flex items-center justify-center gap-4 w-fit`}
                >
                    <button onClick={() => {
                        deleteIndex();
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

export default RemoveIndexModal;