function PreviewModal({ closeLightbox, content }) {
    return (
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
                    src={content}
                    alt="Image is Loading ..."
                    className="object-fill w-full h-full"
                />
            </div>
        </div>
    );
}

export default PreviewModal;