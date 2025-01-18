import { useContext, useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { MainContext } from '../../contexts/mainContext';
import FileUploader from '../FileUploader';
import Dropdown from '../Dropdown';

export default function FileUploaderModal({ show, onHide, hideIndexModal, indexName, handleUpload }) {

    const { theme, categoryOptions, fileFormats, setSelectedCategory } = useContext(MainContext);

    useEffect(() => {
        setSelectedCategory(indexName);
    }, [indexName]);

    function uploadSources() {
        handleUpload(null, selectedFileFormat, selectedFiles);
        onHide();
        hideIndexModal();
    }

    const [selectedIndex, setSelectedIndex] = useState(indexName);
    function handleIndexChange({ value }) {
        setSelectedIndex(value);
        setSelectedCategory(value);
    }

    const [selectedFileFormat, setSelectedFileFormat] = useState(fileFormats[0].value);
    function handleFileFormatChange({ value }) {
        setSelectedFileFormat(value);
    }

    const [selectedFiles, setSelectedFiles] = useState([]);

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            className=""
        >
            <Modal.Body className={`flex flex-col gap-2 ${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
                <div className="flex items-center gap-2">
                    <Dropdown onChange={(option) => handleIndexChange(option)} label="Index" indexName={selectedIndex} options={categoryOptions} />
                    <Dropdown onChange={(option) => handleFileFormatChange(option)} label="File type" options={fileFormats} />
                </div>
                <FileUploader selectedFileFormat={selectedFileFormat} selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} />
            </Modal.Body>
            <Modal.Footer className={`${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
                <div
                    className={`flex items-center justify-center gap-2  rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={uploadSources}
                >
                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Upload</span>
                </div>
            </Modal.Footer>
        </Modal>
    );
}
