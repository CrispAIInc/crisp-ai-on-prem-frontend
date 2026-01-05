import Modal from 'react-bootstrap/Modal';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext.jsx';
import makeApiRequest from '../../api';
import toast from 'react-simple-toasts';
import useResources from '../../hooks/useResources';
import LoadingSpinner from '../LoadingSpinner/index.jsx';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

function RemoveIndexModal({ show, onHide, index, deleteResource, setIsIndexDeleting }) {
    const { theme, knowledgeBase, setCategoryOptions } = useContext(MainContext);

    const { getIndexes } = useResources({ setCategoryOptions });

    async function deleteIndex() {
        try {
            // remove sources before index
            setIsIndexDeleting(true);
            const itemsToBeDeleted = knowledgeBase.filter((item) => item.category.includes(index));
            if (itemsToBeDeleted.length > 0) await deleteResource(null, itemsToBeDeleted);
            await makeApiRequest(`/remove-index`, 'post', { index: index });
            getIndexes();
            toast('Index deleted', { className: `p-2 rounded-md`, theme: theme === 'light' ? 'dark' : 'light' });
        } catch (error) {
            console.log(error.response.data.error);
            toast(error.response.data.error || 'Error deleting index', { className: `p-2 rounded-md`, theme: theme === 'light' ? 'dark' : 'light' });
        } finally {
            setIsIndexDeleting(false);
        }
    }

    return (
        <ConfirmationModal show={show} onHide={onHide} heading="Are you sure you want to delete this index?" subheading="CAUTION: all sources from this category will be permanently deleted." confirmedFn={deleteIndex} />
    );
}

export default RemoveIndexModal;

const ConfirmationModal = ({ show, onHide, heading, subheading, confirmedFn, isDeleting }) => {
    const { theme } = useContext(MainContext);

    if (!show) return null;

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            dialogClassName='text-left'
        >

            <Modal.Body className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
                <div className="flex flex-col items-center justify-center">
                    <ErrorOutlineIcon className="text-red-500 !text-[60px]" />
                    {/* <div className="flex flex-col gap-1"> */}
                    <h2 className="text-2xl font-bold">{heading}</h2>
                    <p className="w-2/3 mx-auto text-center text-md">{subheading}</p>
                    {/* </div> */}
                </div>
            </Modal.Body>
            <Modal.Footer className={`flex items-center gap-2 ${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
                <div
                    className={`flex items-center justify-center gap-2 rounded-full cursor-pointer w-fit py-2 px-3 ${theme === 'light' ? 'bg-textColor-100/10' : 'bg-textColor-100/20'}`}
                    onClick={onHide}
                >
                    <span className={`select-none font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                        No, Keep it.
                    </span>
                </div>

                <div
                    className={`flex items-center justify-center gap-2 rounded-full cursor-pointer w-fit bg-red-500 text-white py-2 px-3`}
                    onClick={confirmedFn}
                >
                    {
                        isDeleting ? <div className="flex items-center gap-1">
                            <LoadingSpinner isSmall />
                            <span className={`select-none font-medium `}>Deleting...</span>
                        </div> : <span className={`select-none font-medium `}>Yes, Delete!</span>
                    }
                </div>
            </Modal.Footer>
        </Modal>
    );
};