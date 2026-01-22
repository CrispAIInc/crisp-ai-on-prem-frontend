import { useContext, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { MainContext } from '../../contexts/mainContext.jsx';
import FileUploaderModal from "../FileUploaderModal";
import { useToast } from '../../contexts/toastContext';
import makeApiRequest from '../../api';
import LoadingSpinner from "../LoadingSpinner";
import useResources from '../../hooks/useResources';

export function IndexModal({ show, onHide, handleUpload }) {

    const { theme, categoryOptions, setCategoryOptions } = useContext(MainContext);

    const { notify } = useToast();

    const [indexName, setIndexName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

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
                        id='indexName'
                        value={indexName}
                        onChange={(e) => setIndexName(e.target.value)}
                        className={`block w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' && 'bg-textColor-300'}`}
                        required
                        onKeyDown={(e) => e.key === 'Enter' && createIndex()}
                    />
                    {isUploadModalOpen && <FileUploaderModal handleUpload={handleUpload} indexName={indexName} show={isUploadModalOpen} hideIndexModal={onHide} onHide={() => setIsUploadModalOpen(false)} />}
                </div>
            </Modal.Body>
            <Modal.Footer className={`flex items-center gap-3 ${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
                <div
                    className={`flex items-center justify-center gap-2  rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={onHide}
                >
                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                        Cancel
                    </span>
                </div>

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
