import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext.jsx';
import GsFile from '../GsFile/index.jsx';

function PreviewModal({ closeLightbox, content, classNames = '', }) {

    const { currentResource } = useContext(MainContext);

    const handleCloseButtonClick = (e) => {
        e.stopPropagation();
        closeLightbox();
    };

    const handleOutsideClick = (e) => {
        if (e.target === e.currentTarget) {
            closeLightbox();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
            onClick={(e) => handleOutsideClick(e)} // Close on click outside or click on lightbox
        >
            <div className={`relative ${currentResource.file_type === "video" ? "!w-[60vw] !h-[75vh]" : "w-full sm:w-2/3 md:w-1/2 lg:w-1/3 h-full"} ${classNames} max-w-[90vw] max-h-[90vh] `}> {/* Wrap lightbox content */}
                <button
                    className="absolute text-2xl text-primary-300 top-4 right-4"
                    onClick={(e) => handleCloseButtonClick(e)} // Close on button click
                >
                    &times;
                </button>
                <GsFile
                    gsUrl={content}
                    alt="Image is Loading ..."
                    className="object-fill w-full h-full"
                />
            </div>
        </div>
    );
}

export default PreviewModal;