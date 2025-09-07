import { useContext, useRef, useState } from 'react';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from "@mui/icons-material/Send";
import './image-upload.css';
import { MainContext } from '../../contexts/mainContext.jsx';
import CustomInput from '../CustomInput';
import PreviewModal from '../PreviewModal';
import toast from 'react-simple-toasts';

const ImageUpload = ({ handleUpload }) => {
    const { theme } = useContext(MainContext);
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedImageInModal, setselectedImageInModal] = useState('');
    const [query, setQuery] = useState('');
    const [isLightboxOpen, setisLightboxOpen] = useState(false);

    const imageGenRefInput = useRef(null);

    function onQueryChange(value) {
        setQuery(value);
    }

    function onImageChange(e) {
        const files = e.target.files;
        // const imagePreviews = files.map(file => URL.createObjectURL(file));
        setSelectedImages(prev => [...prev, ...files]);
    }

    function onImagePreviewRemove(e, image) {
        e.stopPropagation();
        const filteredImages = selectedImages.filter(img => img !== image);
        setSelectedImages(filteredImages);
    }

    const openLightbox = (image) => {
        setisLightboxOpen(true);
        setselectedImageInModal(URL.createObjectURL(image));
    };

    const closeLightbox = () => {
        setisLightboxOpen(false);
    };

    function sendQuery() {
        if (query.trim() === '') {
            toast('Query cannot be empty', { className: `p-2 rounded-md`, theme });
            return;
        }
        if (selectedImages.length === 0) {
            toast('Please upload an image', { className: `p-2 rounded-md`, theme });
            return;
        }
        handleUpload(selectedImages, query);
        setQuery('');
        setSelectedImages([]);
    }

    return (
        <div
            className={`  w-full flex flex-col`}
        >
            {/* images placeholder */}
            <div className={`py-2 flex gap-3 flex-wrap`}>
                {selectedImages.map((image, index) => (
                    <div key={image.name} className='relative' onClick={() => openLightbox(image)}>
                        <CloseIcon className="absolute top-0 right-0 cursor-pointer" onClick={(e) => onImagePreviewRemove(e, image)} />
                        <img src={URL.createObjectURL(image)} alt={`Preview ${index}`} className="cursor-pointer image-preview" />
                    </div>
                ))}
            </div>
            {isLightboxOpen && (
                <PreviewModal closeLightbox={closeLightbox} content={selectedImageInModal} />
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
                    onKeyDown={(e) => e.key === 'Enter' && sendQuery()}
                />
                {/* render file input and hide it */}
                <input multiple type='file' ref={imageGenRefInput} accept='.png,.jpg,.jpeg,.svg' name='image-generation' className='hidden' onChange={(e) => onImageChange(e)} />
                <div
                    className={`p-2 rounded-md cursor-pointer ${theme === "light" ? "border" : "!border !border-textColor-300"
                        }`}
                    onClick={sendQuery}
                >
                    <SendIcon color="primary" />
                </div>
            </div>
        </div>
    );
};

export default ImageUpload;
