import { useContext, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { MainContext } from '../../contexts/mainContext';
import FileUploaderModal from "../FileUploaderModal";
import toast from 'react-simple-toasts';
import Dropdown from '../Dropdown';
import makeApiRequest from '../../api';
import LoadingSpinner from "../LoadingSpinner";

export function IndexModal({ show, onHide, handleUpload }) {

    const { theme, categoryOptions } = useContext(MainContext);

    const [indexName, setIndexName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    async function createIndex() {
        setIsLoading(true);
        if (indexName === '') {
            toast('Index cannot be empty', { className: `p-2 rounded-md`, theme: theme === 'light' ? 'dark' : 'light' });
            setIsLoading(false);
            return;
        }

        if (categoryOptions.find(cat => cat.label?.toLowerCase() === indexName?.toLowerCase())) {
            toast('Index already exists', { className: `p-2 rounded-md`, theme: theme === 'light' ? 'dark' : 'light' });
            setIsLoading(false);
            return;
        }

        try {
            await makeApiRequest('/create-new-index', 'post', { category: indexName });
            setIsUploadModalOpen(true);
        } catch (error) {
            console.log(error.response.data.error);
            toast(error.response.data.error || 'Error creating index', { className: `p-2 rounded-md`, theme: theme === 'light' ? 'dark' : 'light' });
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }


        // onHide();
    }

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="sm"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            dialogClassName='text-left'
        >

            <Modal.Body className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
                <div className="flex flex-col">
                    <label htmlFor="indexName" className={`block text-sm font-medium ${theme === 'dark' && 'text-gray-300'}`}>
                        Index name
                    </label>
                    <input
                        type="text"
                        name="indexName"
                        placeholder='Type index name here'
                        id='indexName' value={indexName} onChange={(e) => setIndexName(e.target.value)}
                        className={`block w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' && 'bg-textColor-300'}`}
                        required
                        onKeyDown={(e) => e.key === 'Enter' && createIndex()}
                    />
                    {isUploadModalOpen && <FileUploaderModal handleUpload={handleUpload} indexName={indexName} show={isUploadModalOpen} hideIndexModal={onHide} onHide={() => setIsUploadModalOpen(false)} />}
                </div>
            </Modal.Body>
            <Modal.Footer className={`${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
                <div
                    className={`flex items-center justify-center gap-2  rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={createIndex}
                >
                    {isLoading ? <LoadingSpinner isSmall /> : <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                        Create
                    </span>}
                </div>
            </Modal.Footer>
        </Modal>
    );
}
