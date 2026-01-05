import React, { useContext, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { MainContext } from '../../contexts/mainContext';
import LoadingSpinner from '../LoadingSpinner';

function ChatTitleUpdaterModal({ isLoading, show, onHide, value, setValue, updateValue, modalRef }) {

    const { theme } = useContext(MainContext);
    // const [isLoading, setIsLoading] = useState(false);

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="sm"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            dialogClassName='text-left'
            ref={modalRef}
        >

            <Modal.Body className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
                <div className="flex flex-col">
                    <label htmlFor="indexName" className={`block text-sm font-medium ${theme === 'dark' && 'text-gray-300'}`}>
                        Rename source
                    </label>
                    <div className="flex items-center gap-1">
                        <input
                            type="text"
                            name="indexName"
                            placeholder='Type index name here'
                            id='indexName'
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className={`flex-1 block w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' && 'bg-textColor-300'}`}
                            required
                            onKeyDown={(e) => e.key === 'Enter' && updateValue()}
                        />
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className={`flex items-center gap-3 ${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
                <div
                    className={`flex items-center justify-center gap-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={onHide}
                >
                    <span className={`select-none font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                        Cancel
                    </span>
                </div>

                <div
                    className={`flex items-center justify-center gap-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={updateValue}
                >
                    {isLoading ? <LoadingSpinner isSmall /> : <span className={`select-none font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                        Save
                    </span>}
                </div>
            </Modal.Footer>
        </Modal>
    );
}

export default ChatTitleUpdaterModal;