import React, { useContext, useEffect, useState } from 'react';
import { MainContext } from "../../contexts/mainContext.jsx";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Checkbox } from "@mui/material";
import BaseHeading from "../BaseHeading";

const FileUploader = ({ isFineGrained, setIsFineGrained, selectedFiles, setSelectedFiles, selectedFileFormat = '', setSelectedFileFormat, closeModals }) => {

    const { isFileUploading, theme } = useContext(MainContext);


    const [fileThumbnails, setFileThumbnails] = useState([]);
    const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);

    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
        // add files to previously set files in selectedFiles
        setSelectedFiles((prev) => [...prev, ...files]);
        const thumbnails = files.map((file) => {
            const type = file.type;
            setSelectedFileFormat(type);
            const preview =
                type.startsWith('image/') || type.startsWith('video/')
                    ? URL.createObjectURL(file)
                    : null;
            return { file, preview };
        });
        setFileThumbnails((prev) => [...prev, ...thumbnails]);
    };

    const handleRemoveThumbnail = (index) => {
        setFileThumbnails((prev) => {
            const updated = [...prev];
            if (updated[index].preview) {
                URL.revokeObjectURL(updated[index].preview); // Clean up URL for images/videos
            }
            updated.splice(index, 1);
            return updated;
        });
    };

    useEffect(() => {
        setSelectedFiles(fileThumbnails?.map(item => item?.file));
    }, [fileThumbnails]);

    const renderThumbnail = (thumbnail, index) => {
        const { file, preview } = thumbnail;
        const type = file.type;

        if (type.startsWith('image/')) {
            return (
                <img
                    src={preview}
                    alt={file.name}
                    className="object-cover w-full h-32 rounded-md"
                />
            );
        } else if (type.startsWith('video/')) {
            return (
                <video
                    src={preview}
                    className="object-cover w-full h-32 rounded-md"
                    controls
                />
            );
        } else if (type === 'application/pdf') {
            return (
                <div className="flex flex-col items-center justify-center w-full h-32 bg-gray-200 rounded-md">
                    <p className="font-bold text-red-500">PDF</p>
                    <p className="text-xs text-center text-gray-500 break-all">{file.name}</p>
                </div>
            );
        } else if (
            type === 'application/msword' ||
            type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
            return (
                <div className="flex flex-col items-center justify-center w-full h-32 bg-blue-200 rounded-md">
                    <p className="font-bold text-blue-700">DOC</p>
                    <p className="text-xs text-center text-gray-500 break-all">{file.name}</p>
                </div>
            );
        } else {
            return (
                <div className="flex flex-col items-center justify-center w-full h-32 bg-gray-300 rounded-md">
                    <p className="font-bold text-gray-700">Unsupported</p>
                    <p className="text-xs text-gray-500">{file.name}</p>
                </div>
            );
        }
    };

    // const [progress, setProgress] = useState(0);
    // const [isProgressStarted, setIsProgressStarted] = useState(false);

    return (
        <div className="relative flex flex-col items-center p-4 border-2 border-dashed rounded-md border-primary-200">
            <input
                type="file"
                multiple
                // accept={selectedFileFormat || ''}
                accept=".pdf, image/*, video/*"
                className="hidden"
                id="file-input"
                onChange={handleFileUpload}
            />
            <div className="relative !ml-auto flex items-center gap-1">
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
                right-0
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
            <label
                htmlFor="file-input"
                className="w-full p-4 text-center cursor-pointer text-primary-300"
            >
                {!isFileUploading ? <>
                    <p className="font-bold">Click to browse files</p>

                    <p className="mt-1 text-sm">
                        If fine-grained mode selected, videos longer than <span className="font-medium">15 minutes</span> will be processed in <span className="font-medium">normal mode</span>
                    </p>

                    <p className="mt-1 text-sm">
                        Supported: Images, Videos, PDFs | Size ≤2GB | Video duration ≤5 hours
                    </p>
                </> : <p className="text-sm">Processing source ingestion...</p>
                }
            </label>
            <div className="grid w-full grid-cols-3 gap-4 mt-4">
                {fileThumbnails.map((thumbnail, index) => (
                    <div key={index} className="relative">
                        {renderThumbnail(thumbnail, index)}
                        <button
                            onClick={() => handleRemoveThumbnail(index)}
                            className="absolute flex flex-col items-center justify-center w-5 h-5 text-xs text-center text-white bg-black rounded-full top-1 right-1"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FileUploader;
