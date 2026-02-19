import React, { useContext, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { MainContext } from '../../contexts/mainContext';

import DataObjectIcon from '@mui/icons-material/DataObject';
import JsonViewer from '../JsonViewer';
import RippleButton from '../RippleButton';

const KnowledgeGraphModal = ({ show, onHide }) => {

    const {
        theme,
        selectedJsonEntity
    } = useContext(MainContext);

    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = () => {
        setIsDownloading(true);
        try {
            const jsonString = JSON.stringify(selectedJsonEntity.graph, null, 2); // formatted
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "json-structure.json";
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.log(error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            centered
            className="graph-modal p-0 flex-1"
        >
            <Modal.Header closeButton className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white !border-b-textColor-200'}`}>
                <Modal.Title id="contained-modal-title-vcenter" className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1">
                        <DataObjectIcon className={`${theme === 'dark' && 'text-textColor-200'}`} fontSize="large" />
                        <p>JSON Structure</p>
                    </div>
                    <div>
                        <RippleButton cssClasses='flex items-center gap-1 disabled:cursor-not-allowed p-2'
                            disabled={isDownloading} onClick={handleDownload}>
                            {isDownloading ? <span className="animate-customPulse">Downloading...</span> : 'Download JSON'}
                        </RippleButton>
                    </div>
                    {/* JSON/Graph switched */}
                    {/* ... */}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body
                className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}  p-0 `}
            >
                <div className="flex flex-col h-[60vh]">

                    {/* Scrollable JSON Container */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className={`${theme === "light" ? 'bg-[#f5f5f5]' : 'bg-[#222]'} rounded-lg min-h-full`}>
                            <JsonViewer />
                        </div>
                    </div>

                </div>
            </Modal.Body>

            <Modal.Footer className={`${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
                <div
                    className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={onHide}
                >
                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Ok</span>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default KnowledgeGraphModal;