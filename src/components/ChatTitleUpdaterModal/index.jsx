import { useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import { MainContext } from '../../contexts/mainContext';
import LoadingSpinner from '../LoadingSpinner';

function ChatTitleUpdaterModal({ isLoading, show, onHide, value, setValue, updateValue, modalRef }) {

    const { theme } = useContext(MainContext);
    const isTitleValid = value.trim().length > 0;

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            dialogClassName='text-left'
            ref={modalRef}
        >
            <Modal.Header className={`border-0 pb-0 ${theme === 'dark' ? '!bg-textColor-300 !text-white' : ''}`}>
                <div className="flex flex-col gap-1">
                    <Modal.Title id="contained-modal-title-vcenter" className={`text-lg font-semibold ${theme === 'dark' ? 'text-textColor-100' : 'text-gray-900'}`}>
                        Update chat title
                    </Modal.Title>
                    <p className={`text-sm m-0 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                        Choose a clear title that reflects the conversation.
                    </p>
                </div>
            </Modal.Header>

            <Modal.Body className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
                <div className="flex flex-col">
                    <label htmlFor="indexName" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Chat title
                    </label>
                    <div className="flex items-center gap-1">
                        <input
                            type="text"
                            name="indexName"
                            placeholder='Type a new chat title here'
                            id='indexName'
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className={`flex-1 block w-full p-2 mt-1  rounded-xl outline-none transition ${theme === 'dark'
                                ? '!border !border-textColor-200 bg-textColor-300 text-white placeholder:text-gray-400'
                                : '!border !border-gray-300 bg-white text-gray-900'}`}
                            required
                            onKeyDown={(e) => e.key === 'Enter' && isTitleValid && updateValue()}
                        />
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className={`flex items-center justify-end gap-3 ${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
                <button
                    type="button"
                    className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 w-fit transition ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={onHide}
                >
                    <span className={`select-none font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                        Cancel
                    </span>
                </button>

                <button
                    type="button"
                    className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 w-fit transition ${!isTitleValid || isLoading
                        ? 'cursor-not-allowed text-gray-400'
                        : theme === 'dark'
                            ? 'hover:bg-purple-500/20 text-purple-300'
                            : 'hover:bg-purple-50 text-purple-600'}`}
                    onClick={isTitleValid ? updateValue : undefined}
                    disabled={!isTitleValid || isLoading}
                >
                    {isLoading ? <LoadingSpinner isSmall /> : <span className={`select-none font-medium`}>
                        Save title
                    </span>}
                </button>
            </Modal.Footer>
        </Modal>
    );
}

export default ChatTitleUpdaterModal;