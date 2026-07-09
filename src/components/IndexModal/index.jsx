import { useContext, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { MainContext } from '../../contexts/mainContext.jsx';
import FileUploaderModal from "../FileUploaderModal";
import { useToast } from '../../contexts/toastContext';
import makeApiRequest from '../../api';
import LoadingSpinner from "../LoadingSpinner";
import useResources from '../../hooks/useResources';
import BaseHeading from '../BaseHeading/index.jsx';

export function IndexModal({ show, onHide, handleUpload }) {

    const { theme, categoryOptions, setCategoryOptions } = useContext(MainContext);

    const { notify } = useToast();

    const [indexName, setIndexName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const isCreateDisabled = !indexName.trim();

    const { getIndexes } = useResources({ setCategoryOptions });

    async function createIndex() {
        setIsLoading(true);
        if (indexName === '') {
            notify({
                variant: "error",
                heading: "Oops!",
                subheading: "Index cannot be empty!",
            });
            setIsLoading(false);
            return;
        }

        try {
            const newIndex = await makeApiRequest('/create-new-index', 'post', { category: indexName });
            setIndexName(newIndex?.category);
            getIndexes();
            notify({
                variant: "success",
                heading: "Index created!",
            });
        } catch (error) {
            console.log(error.response.data.error);
            notify({
                variant: "error",
                heading: "Oops!",
                subheading: "Error creating index",
            });
            setIsLoading(false);
        } finally {
            setIsLoading(false);
            // setIndexName(prev => (categoryOptions.find(index => index === prev)));
            setIsUploadModalOpen(true);
        }


        // onHide();
    }

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

            <Modal.Header closeButton className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white !border-b-textColor-200'}`}>
                <Modal.Title id="contained-modal-title-vcenter">
                    <BaseHeading text="Create New Index" className="text-xl" />
                    <p className="text-slate-400 text-sm mt-0.5">Create a new index to organize your uploaded sources.</p>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
                <div className="flex flex-col">
                    <label htmlFor="indexName" className={`block text-md font-medium ${theme === 'dark' && 'text-gray-300'}`}>
                        Index name
                    </label>
                    <input
                        type="text"
                        name="indexName"
                        placeholder='e.g Finance, Marketing, etc.'
                        id='indexName'
                        ref={(input) => input && input.focus()}
                        value={indexName}
                        onChange={(e) => setIndexName(e.target.value)}
                        className={`block w-full p-2 mt-1  rounded-md outline-none ${theme === 'dark' ? 'bg-textColor-300 !border !border-textColor-200' : '!border !border-slate-300/80'}`}
                        required
                        onKeyDown={(e) => e.key === 'Enter' && createIndex()}
                    />
                    {isUploadModalOpen && <FileUploaderModal handleUpload={handleUpload} indexName={indexName} show={isUploadModalOpen} hideIndexModal={onHide} onHide={() => setIsUploadModalOpen(false)} />}
                </div>
            </Modal.Body>
            <Modal.Footer className={`flex items-center gap-3 ${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
                <div
                    className={`flex items-center justify-center gap-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={onHide}
                >
                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                        Cancel
                    </span>
                </div>

                <button
                    type="button"
                    disabled={isCreateDisabled || isLoading}
                    onClick={createIndex}
                    className={`flex items-center justify-center gap-2 rounded-md px-4 py-2 transition duration-150 ${isCreateDisabled || isLoading ? (theme === 'light' ? 'bg-gray-200 text-gray-400/50' : 'bg-textColor-100/25 text-gray-700') : 'bg-[linear-gradient(90deg,#755bea,#b76894)] text-white hover:opacity-90'} ${theme === 'dark' && !isCreateDisabled && !isLoading ? '' : ''} ${isCreateDisabled || isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    {isLoading ? <LoadingSpinner isSmall /> : <span className="font-medium">Create</span>}
                </button>
            </Modal.Footer>
        </Modal>
    );
}
