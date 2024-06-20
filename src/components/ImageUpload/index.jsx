import { useContext, useRef, useState } from 'react';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from "@mui/icons-material/Send";
import './image-upload.css';
import { MainContext } from '../../contexts/mainContext';
import CustomInput from '../CustomInput';

const ImageUpload = () => {
    const { theme } = useContext(MainContext);
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedImageInModal, setselectedImageInModal] = useState('');
    const [query, setQuery] = useState('');
    const [isLightboxOpen, setisLightboxOpen] = useState(false);

    const imageGenRefInput = useRef(null);

    function onQueryChange(e) {
        setQuery(e.target.value);
    }

    function onImageChange(e) {
        const files = Array.from(e.target.files);
        const imagePreviews = files.map(file => URL.createObjectURL(file));
        setSelectedImages(prev => [...prev, ...imagePreviews]);
    }

    function onImagePreviewRemove(e, image) {
        e.stopPropagation();
        const filteredImages = selectedImages.filter(img => img !== image);
        setSelectedImages(filteredImages);
    }

    const openLightbox = (image) => {
        setisLightboxOpen(true);
        setselectedImageInModal(image);
    };

    const closeLightbox = () => {
        setisLightboxOpen(false);
    };

    return (
        <div
            className={`  w-full flex flex-col`}
        >
            {/* images placeholder */}
            <div className={`py-2 flex gap-3 flex-wrap`}>
                {selectedImages.map((image, index) => (
                    <div key={image} className='relative' onClick={() => openLightbox(image)}>
                        <CloseIcon className="absolute top-0 right-0 cursor-pointer" onClick={(e) => onImagePreviewRemove(e, image)} />
                        <img src={image} alt={`Preview ${index}`} className="cursor-pointer image-preview" />
                    </div>
                ))}
            </div>
            {isLightboxOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
                    onClick={closeLightbox} // Close on click outside or click on lightbox
                >
                    <div className="relative w-96 h-96 max-w-[90vw] max-h-[90vh]"> {/* Wrap lightbox content */}
                        <button
                            className="absolute text-2xl text-primary-300 top-4 right-4"
                            onClick={closeLightbox} // Close on button click
                        >
                            &times;
                        </button>
                        <img
                            src={selectedImageInModal}
                            alt="Image is Loading ..."
                            className="object-fill w-full h-full"
                        />
                    </div>
                </div>
            )}
            {/* main area for uploading and writing query */}
            <div className='flex items-center gap-2'>
                <div
                    className={`p-2 rounded-md cursor-pointer ${theme === "light" ? "border" : "!border !border-textColor-300"
                        }`}
                    onClick={() => imageGenRefInput.current.click()}
                >
                    <AttachFileOutlinedIcon color="primary" />
                </div>
                <CustomInput
                    placeholder="Message model..."
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                />
                {/* render file input and hide it */}
                <input multiple type='file' ref={imageGenRefInput} accept='.png,.jpg,.jpeg,.svg' name='image-generation' className='hidden' onChange={(e) => onImageChange(e)} />
                <div
                    className={`p-2 rounded-md cursor-pointer ${theme === "light" ? "border" : "!border !border-textColor-300"
                        }`}
                >
                    <SendIcon color="primary" />
                </div>
            </div>
        </div>
        // <div className="image-upload-container">
        // <div className="image-preview-container">
        //     {selectedImages.map((image, index) => (
        //         <img key={index} src={image} alt={`Preview ${index}`} className="image-preview" />
        //     ))}
        // </div>
        //     <div className="input-container">
        //         <input
        //             type="file"
        //             id="imageUpload"
        //             multiple
        //             onChange={handleImageChange}
        //             style={{ display: 'none' }}
        //         />
        //         <label htmlFor="imageUpload" className="upload-button">Choose Images</label>
        //         <input type="text" placeholder="Type your question here..." className="question-input" />
        //         <button className="send-button">Send</button>
        //     </div>
        // </div>
    );
};

export default ImageUpload;
