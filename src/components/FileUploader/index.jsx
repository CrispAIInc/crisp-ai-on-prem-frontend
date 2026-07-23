import React, { useContext, useEffect, useState } from 'react';
import { MainContext } from "../../contexts/mainContext.jsx";
import { ArrowUpFromLine } from 'lucide-react';
import { generatePdfThumbnail } from '../../utils.js';


const FileUploader = ({ isFineGrained, setIsFineGrained, selectedFiles, setSelectedFiles, selectedFileFormat = '', setSelectedFileFormat, setIsVideoIncluded }) => {

    const { isFileUploading, theme } = useContext(MainContext);


    const [fileThumbnails, setFileThumbnails] = useState([]);
    // const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);

    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files);

        setSelectedFiles((prev) => [...prev, ...files]);

        const thumbnails = await Promise.all(
            files.map(async (file) => {
                const type = file.type;

                let preview = null;

                if (type.startsWith("image/") || type.startsWith("video/")) {
                    preview = URL.createObjectURL(file);
                } else if (type === "application/pdf") {
                    preview = await generatePdfThumbnail(file);
                }

                return {
                    file,
                    preview,
                };
            })
        );

        setSelectedFileFormat(files[0]?.type ?? "");

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
        // if no video files in the selected files, set isVideoNotIncluded to true, else false
        const hasVideo = fileThumbnails.some(item => item.file.type.startsWith('video/'));
        setIsVideoIncluded(hasVideo);
    }, [fileThumbnails]);

    const renderThumbnail = (thumbnail, index) => {
        const { file, preview } = thumbnail;
        const type = file.type;

        if (type.startsWith('image/') || type === 'application/pdf') {
            return (
                <img
                    src={preview}
                    alt={file.name}
                    className="object-cover w-full h-full rounded-xl !border !border-primary-200"
                />
            );
        } else if (type.startsWith('video/')) {
            return (
                <video
                    src={preview}
                    className="object-cover w-full h-full rounded-xl !border !border-primary-200"
                    controls
                />
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

    return (
        <div className={`relative flex flex-col items-center p-4 border-dashed border-[0.5px] rounded-xl border-primary-200 ${theme === 'light' ? 'bg-primary-100/50' : 'bg-primary-300/5'}`}>
            <input
                type="file"
                multiple
                // accept={selectedFileFormat || ''}
                accept=".pdf, image/*, video/*"
                className="hidden"
                id="file-input"
                onChange={handleFileUpload}
            />
            <label
                htmlFor="file-input"
                className="w-full p-4 text-center cursor-pointer text-primary-300"
            >
                {!isFileUploading ? <>
                    <ArrowUpFromLine size={40} className="mx-auto mb-3" />
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
            <div className="w-full flex items-center gap-4 mt-4">
                {fileThumbnails.map((thumbnail, index) => (
                    <div key={index} className="relative w-20 h-20 rounded-xl">
                        {renderThumbnail(thumbnail, index)}
                        <button
                            onClick={() => handleRemoveThumbnail(index)}
                            className="absolute flex flex-col items-center justify-center w-5 h-5 text-xs text-center text-white bg-black/55 rounded-full -top-2 -right-2"
                        >
                            ✕
                        </button>
                        <p className="mt-1 text-xs truncate">{thumbnail?.file?.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FileUploader;
