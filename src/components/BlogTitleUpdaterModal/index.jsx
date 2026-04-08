import { useContext, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import makeApiRequest from '../../api';
import LoadingSpinner from '../LoadingSpinner';
import { MainContext } from '../../contexts/mainContext';
import { useToast } from "../../contexts/toastContext";

const BlogTitleUpdaterModal = ({ show, onHide, blog }) => {

    const {
        setBlogs,
    } = useContext(MainContext);

    const { notify } = useToast();

    const [newBlogTitle, setNewBlogTitle] = useState(blog.title);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        try {
            setIsLoading(true);

            const { success, message } = await makeApiRequest(`/blog/${blog.blog_id}`, 'PUT', { title: newBlogTitle });

            if (success) {
                setBlogs(prev => prev.map(item => {
                    if (item.blog_id === blog.blog_id) {
                        return { ...item, title: newBlogTitle };
                    }
                    return item;
                }));
                notify({
                    variant: 'success',
                    heading: 'Blog title updated',
                });
                onHide();
            }
            else {
                throw new Error(message);
            }
        } catch (error) {
            console.error("Error updating blog title:", error.message);
            notify({
                variant: 'error',
                heading: 'Error updating blog title',
                subheading: error.message || "An error occurred while updating the blog title. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!show) return null;

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="sm"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            dialogClassName='text-left'
        >

            <Modal.Body>
                <div className='flex flex-col items-start justify-center gap-3'>
                    {/* project name */}
                    <div className="flex flex-col w-full">
                        <label htmlFor="indexName" className={`block text-sm font-medium`}>
                            Blog title
                        </label>
                        <div className="flex items-center gap-1">
                            <input
                                type="text"
                                name="blogTitle"
                                placeholder='Blog title'
                                id='blogTitle'
                                value={newBlogTitle}
                                onChange={(e) => setNewBlogTitle(e.target.value)}
                                className={`flex-1 block w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500`}
                                required
                                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            />
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className={`flex items-center gap-3 `}>
                <div
                    className={`flex items-center justify-center gap-2 rounded-md cursor-pointer w-fit hover:bg-light-hover-100`}
                    onClick={onHide}
                >
                    <span className={`select-none font-medium text-textColor-300`}>
                        Cancel
                    </span>
                </div>

                <div
                    className={`flex items-center justify-center gap-2 rounded-md cursor-pointer w-fit hover:bg-light-hover-100`}
                    onClick={handleSave}
                >
                    {isLoading ? <LoadingSpinner isSmall /> : <span className={`select-none font-medium text-purple-500`}>
                        rename
                    </span>}
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default BlogTitleUpdaterModal;