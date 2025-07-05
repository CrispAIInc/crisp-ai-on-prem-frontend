import { useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import { MainContext } from '../../contexts/mainContext';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';

export function ChapterDetailsModal({ show, onHide, chapter, workspaceContainer }) {

    const { theme, setCurrentResource, setJumpToPage, contentPanelContainerRef } = useContext(MainContext);

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            className="relative note-modal"
        >
            <div className="w-56 h-56 bg-blue-500 rounded-full absolute left-1/2 top-10 -z-0 blur-[160px]"></div>
            <div className="w-56 h-56 bg-purple-500 rounded-full absolute left-35 top-40 -z-0 blur-[160px]"></div>
            <div className="w-56 h-56 bg-yellow-300 rounded-full absolute left-3/4 top-80 -z-0 blur-[160px]"></div>
            <Modal.Header closeButton className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white !border-b-textColor-200'}`}>
                <Modal.Title id="contained-modal-title-vcenter">
                    Chapter details
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
                <div className='sm:grid sm:grid-cols-[30%,1fr] sm:gap-4'>
                    {/* left part => thumbnail */}
                    <div className="flex items-center justify-center w-2/3 mx-auto mb-4 sm:w-full sm:h-fit sm:mb-0 ">
                        <img
                            src={import.meta.env.VITE_API_ENDPOINT + (chapter.keyframe_url ?? chapter.thumbnail_url)}
                            alt="chapter thumbnail"
                            className="object-cover w-full h-full border rounded-lg shadow-2xl border-primary-300"
                        />
                    </div>
                    {/* right part => details */}
                    <div className="">
                        {
                            chapter.timestamp ? <div className='text-[15px] cursor-pointer text-primary-300  flex items-center gap-2 mb-2 w-fit tracking-wider' onClick={() => {

                                setCurrentResource(prev => ({ ...prev, timestamp: chapter.timestamp[0] }));
                                onHide();
                                contentPanelContainerRef.current.scrollTo({
                                    top: 0,
                                    behavior: "smooth", // Enables smooth scrolling
                                });
                            }}>
                                <AccessTimeIcon size="medium" /> {chapter.timestamp[0]} - {chapter.timestamp[1]}
                            </div> : <div className='flex items-center gap-2 mb-0 text-[9px] cursor-pointer font-bold text-primary-300 w-fit' onClick={() => {

                                setJumpToPage({ page: parseInt(chapter.page) });
                                onHide();
                                contentPanelContainerRef.current.scrollTo({
                                    top: 0,
                                    behavior: "smooth", // Enables smooth scrolling
                                });
                            }}>
                                <MenuBookIcon /> <span className="text-md">{chapter.page}</span>
                            </div>
                        }
                        <h3 className="text-xl font-semibold">{chapter.title}</h3>
                        <p className="mt-2 text-md">{chapter.content}</p>
                    </div>
                </div>
            </Modal.Body>
            {/* <Modal.Footer className={`${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
                <div
                    className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={onHide}
                >
                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Ok</span>
                </div>
            </Modal.Footer> */}
        </Modal>
    );
}
