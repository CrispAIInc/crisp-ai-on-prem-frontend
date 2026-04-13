import { useContext, useEffect, useRef, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { MainContext } from '../../contexts/mainContext';

import useFirebase from '../../hooks/useFirebase';
import RippleButton from '../RippleButton';

import { renderAsync } from "docx-preview";

import InfoIcon from '@mui/icons-material/Info';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import LoadingSpinner from '../LoadingSpinner';
import { Drawer } from '@mui/material';
import BlogProps from '../BlogProps';


function BlogViewerModal({ show, onHide }) {

    const {
        theme,
        selectedBlog,
    } = useContext(MainContext);

    const { getPublicUrl } = useFirebase();

    const [isDownloading, setIsDownloading] = useState(false);
    const viewer = useRef(null);
    const [isDocLoaded, setIsDocLoaded] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const [isBlogPropsOpen, setIsBlogPropsOpen] = useState(false);

    const handleToggleBlogProps = () => {
        setIsBlogPropsOpen(prev => !prev);
    };

    async function renderDocument() {
        try {
            const publicReelUrl = await getPublicUrl(selectedBlog.blog_url);

            const res = await fetch(publicReelUrl);
            const blob = await res.blob();

            viewer.current.innerHTML = "";
            await renderAsync(blob, viewer.current);
            setIsDocLoaded(true);
        } catch (error) {
            console.log(error);
            setIsDocLoaded(false);
            setErrorMessage("Failed to load the document.");
        }
    }

    useEffect(() => {
        renderDocument();
    }, [selectedBlog.blog_url]);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {

            const publicReelUrl = await getPublicUrl(selectedBlog.blog_url);

            const link = document.createElement("a");
            link.href = selectedBlog.title;
            link.download = selectedBlog.title + ".docx";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // const link = document.createElement("a");
            // link.href = selectedBlog.blog_url;
            // link.download = `${selectedBlog.title}.docx`;
            // document.body.appendChild(link);
            // link.click();

            // document.body.removeChild(link);
            // URL.revokeObjectURL(selectedBlog.blog_url);
        } catch (error) {
            console.log(error);
        } finally {
            setIsDownloading(false);
        }
    };

    async function retryRenderDocument() {
        setErrorMessage(null);
        setIsDocLoaded(false);
        await renderDocument();
    }


    return (
        <>
            <Modal
                show={show}
                onHide={onHide}
                size="lg"
                centered
                className="graph-modal p-0 flex-1"
            >
                <Modal.Header className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white !border-b-textColor-200'}`}>
                    <Modal.Title id="contained-modal-title-vcenter" className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1">
                            <p>{selectedBlog.title}</p>
                        </div>
                        <div className="flex gap-2 items-center">
                            <div title="Blog Details">
                                <InfoIcon className={`p-2 z-50 !text-[28px] text-white rounded-full cursor-pointer ${theme === " light" ? "bg-[linear-gradient(90deg,#a99df2,#d992b1)]" : "bg-[linear-gradient(90deg,#755bea,#b76894)]"} right-5 top-10`} onClick={handleToggleBlogProps} />
                            </div>
                            <div title="Download" onClick={handleDownload}>
                                {
                                    isDownloading ? (
                                        <LoadingSpinner isSmall />
                                    ) : (
                                        <FileDownloadIcon className={`p-2 z-50 !text-[28px] text-white rounded-full cursor-pointer ${theme === " light" ? "bg-[linear-gradient(90deg,#a99df2,#d992b1)]" : "bg-[linear-gradient(90deg,#755bea,#b76894)]"} right-5 top-10`} />
                                    )
                                }
                            </div>
                        </div>
                        {/* <div>
                        <RippleButton cssClasses='flex items-center gap-1 disabled:cursor-not-allowed p-2'
                            disabled={isDownloading} onClick={handleDownload}>
                            {isDownloading ? <span className="animate-customPulse">Downloading...</span> : 'Download'}
                        </RippleButton>
                    </div> */}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body
                    className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}  p-0 `}
                >
                    <div className="flex flex-col h-[60vh]">
                        <div className="flex-1 overflow-auto p-6">
                            <div
                                ref={viewer}
                                className={`
        w-full min-h-full rounded-lg
        ${theme === "light" ? "bg-[#f5f5f5]" : "bg-[#222]"}

        [&_.docx]:w-full
        [&_.docx]:max-w-full

        [&_.docx-wrapper]:w-full
        [&_.docx-wrapper]:flex
        [&_.docx-wrapper]:justify-center
        [&_.docx-wrapper]:overflow-x-auto

        [&_.docx-wrapper>section]:w-full
        [&_.docx-wrapper>section]:max-w-full
        [&_.docx-wrapper>section]:box-border
        [&_.docx-wrapper>section]:bg-white
        [&_.docx-wrapper>section]:rounded-xl
        [&_.docx-wrapper>section]:shadow-lg

        [&_.docx-wrapper>section]:scale-[0.99]
        [&_.docx-wrapper>section]:origin-top
        [&_.docx-wrapper>section]:!p-8
    [&_.docx-wrapper>section]:!m-0
        [&_.docx-wrapper]:p-2
      `}
                            />
                            {
                                (!isDocLoaded || errorMessage) && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {
                                            errorMessage ? (
                                                <div className="flex flex-col items-center justify-center gap-4 p-4">
                                                    <p className="text-red-500">{errorMessage}</p>
                                                    <RippleButton cssClasses='flex items-center gap-1 p-2' onClick={retryRenderDocument}>
                                                        Retry
                                                    </RippleButton>
                                                </div>
                                            ) : (
                                                !isDocLoaded && (
                                                    <div className="flex items-center justify-center h-full">
                                                        <span className="animate-customPulse">Loading document...</span>
                                                    </div>
                                                )
                                            )
                                        }
                                    </div>
                                )
                            }
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
                {/* Blog properties side drawer */}
                <Drawer className='pointer-events-auto' slotProps={{ backdrop: { invisible: true } }} anchor="right" variant="persistent" open={isBlogPropsOpen} onClose={handleToggleBlogProps}>
                    <BlogProps blog={selectedBlog} closeBlogProps={handleToggleBlogProps} />
                </Drawer>
            </Modal>

        </>
    );
}

export default BlogViewerModal;