import { useContext, useEffect, useState } from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Checkbox } from "@mui/material";
import Modal from 'react-bootstrap/Modal';
import { MainContext } from '../../contexts/mainContext.jsx';
import FileUploader from '../FileUploader';
import Dropdown from '../Dropdown';
import VideoProcessingSettings from '../VideoProcessingSettings.jsx';
import BaseHeading from '../BaseHeading/index.jsx';

export default function FileUploaderModal({ show, onHide, hideIndexModal, indexName, handleUpload }) {

    const { theme, categoryOptions, isFileUploading, fileFormats, setSelectedCategory, frameExtractionRate, setFrameExtractionRate } = useContext(MainContext);

    const [selectedFiles, setSelectedFiles] = useState([]);
    const isUploadDisabled = isFileUploading || selectedFiles.length === 0;

    useEffect(() => {
        if (indexName !== null) {
            setSelectedCategory(indexName);
        }
    }, [indexName]);

    useEffect(() => {
        if (indexName === null) hideIndexModal();
    }, []);

    function closeModals() {
        onHide();
        hideIndexModal();
    }

    function uploadSources() {
        onHide();
        handleUpload(null, null, selectedFiles, isFineGrained);
    }

    const [selectedIndex, setSelectedIndex] = useState(indexName);
    function handleIndexChange({ value }) {
        setSelectedIndex(value);
        if (indexName !== null) {
            setSelectedCategory(value);
        }
    }

    const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);
    const [selectedFileFormat, setSelectedFileFormat] = useState(fileFormats[0].value);
    const [isVideoIncluded, setIsVideoIncluded] = useState(false);
    const [isFineGrained, setIsFineGrained] = useState(false);

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            className="!overflow-x-hidden"
        >
            <Modal.Body className={`!overflow-x-hidden flex flex-col gap-2 ${theme === 'light' ? '' : 'bg-textColor-300 text-white'} select-none`}>
                {indexName !== null && <div className="flex items-center gap-2">
                    <Dropdown onChange={(option) => handleIndexChange(option)} label="Index" indexName={selectedIndex} options={categoryOptions} />
                    {/* <Dropdown onChange={(option) => handleFileFormatChange(option)} label="File type" options={fileFormats} /> */}
                </div>}
                <FileUploader isFineGrained={isFineGrained} setIsFineGrained={setIsFineGrained} closeModals={closeModals} selectedFileFormat={selectedFileFormat} setSelectedFileFormat={setSelectedFileFormat} selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} setIsVideoIncluded={setIsVideoIncluded} />
                {
                    isVideoIncluded && (
                        <div>
                            {/* Header */}
                            <div className="px-3 py-2 mb-1">
                                <div className="flex items-center gap-2">
                                    <span className={`${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'} text-sm font-semibold tracking-wide uppercase`}>
                                        Video processing settings
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                {/* fine grained mode */}
                                {/* <div className="flex flex-col ml-3">
                                    <div className="relative flex items-center gap-1">
                                        <Checkbox
                                            className={`p-0 "
                                 }`}
                                            checked={isFineGrained}
                                            onChange={(e) => setIsFineGrained(e.target.checked)}
                                            inputProps={{ "aria-label": "Select All Sources" }}
                                            label="Fine-grained mode"
                                        />

                                        <BaseHeading text="Fine-grained mode" />

                                        <InfoOutlinedIcon onMouseOver={() => setIsInfoTooltipOpen(true)} onMouseLeave={() => setIsInfoTooltipOpen(false)} className='!relative !w-5' style={{ color: `${theme === 'light' ? '#777' : '#ABAEB4'}` }} />

                                        {
                                            isInfoTooltipOpen && (
                                                <div
                                                    className={
                                                        `absolute
                                left-0
                                top-full
                                mt-2
                                z-40
                                w-[280px]
                                max-w-[calc(100vw-40px)]
                                p-2
                                rounded-md
                                shadow-[0px_0px_30px_-2px_rgba(82,79,79,0.6)]
                                break-words
                                ${theme === 'light' ? 'bg-white' : 'bg-textColor-300'}
                                                `
                                                    }
                                                >
                                                    <BaseHeading text="Get high detail info about visual part of the video. Processing time may increase." />
                                                </div>
                                            )
                                        }
                                    </div>
                                </div> */}
                                {/* Frame Extraction Rate */}
                                <div className="flex flex-col">
                                    <p className="text-slate-400 text-xs mt-0.5 px-3">Select a frame extraction rate</p>
                                    <VideoProcessingSettings
                                        value={frameExtractionRate}
                                        onChange={(val) => {
                                            setFrameExtractionRate(val);
                                            console.log(val);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
            </Modal.Body>
            <Modal.Footer className={`flex items-center gap-2 ${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
                <div
                    className={`flex items-center justify-center gap-2  rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={onHide}
                >
                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Cancel</span>
                </div>
                <button
                    type="button"
                    disabled={isUploadDisabled}
                    onClick={uploadSources}
                    className={`flex items-center justify-center gap-2 rounded-md px-4 py-2 transition duration-150 ${isUploadDisabled ? `cursor-not-allowed ${(theme === 'light' ? 'bg-gray-200 text-gray-400/50' : 'bg-textColor-100/25 text-gray-700')}` : 'bg-[linear-gradient(90deg,#755bea,#b76894)] text-white hover:opacity-90'}`}
                >
                    <span className="font-medium">Upload</span>
                </button>
            </Modal.Footer>
        </Modal>
    );
}
