import { useContext, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import makeApiRequest from '../../api';
import LoadingSpinner from '../LoadingSpinner';
import { MainContext } from '../../contexts/mainContext';
import { useToast } from "../../contexts/toastContext";

const BlogTitleUpdaterModal = ({ show, onHide, blog }) => {

    const {
        setBlogs,
        theme,
    } = useContext(MainContext);

    const { notify } = useToast();

    const [newBlogTitle, setNewBlogTitle] = useState(blog.title);
    const [isLoading, setIsLoading] = useState(false);
    const isTitleValid = newBlogTitle.trim().length > 0;

    const handleSave = async () => {
        if (!isTitleValid) return;

        try {
            setIsLoading(true);

            const { success, message, blog_url, new_title } = await makeApiRequest(`/blog/${blog.blog_id}`, 'PUT', { title: newBlogTitle.trim() });

            if (success) {
                setBlogs(prev => prev.map(item => {
                    if (item.blog_id === blog.blog_id) {
                        return { ...item, title: new_title, blog_url };
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
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            dialogClassName='text-left'
        >
            <Modal.Header className={`border-0 pb-0 ${theme === 'dark' && '!bg-textColor-300 !text-white'}`}>
                <div className="flex flex-col gap-1">
                    <Modal.Title id="contained-modal-title-vcenter" className={`text-lg font-semibold ${theme === 'dark' ? 'text-textColor-100' : 'text-gray-900'}`}>
                        Update blog title
                    </Modal.Title>
                    <p className={`text-sm m-0 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                        Choose a clear title that matches the content of your blog.
                    </p>
                </div>
            </Modal.Header>

            <Modal.Body className={`pt-3 ${theme === 'dark' ? 'bg-textColor-300 text-white' : ''}`}>
                <div className='flex flex-col items-start justify-center gap-3'>
                    <div className="flex flex-col w-full">
                        <label htmlFor="blogTitle" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Blog title
                        </label>
                        <input
                            type="text"
                            name="blogTitle"
                            placeholder='Enter a new blog title'
                            id='blogTitle'
                            value={newBlogTitle}
                            onChange={(e) => setNewBlogTitle(e.target.value)}
                            className={`flex-1 block w-full p-2 mt-1 rounded-xl outline-none transition ${theme === 'dark'
                                ? '!border !border-textColor-200 bg-textColor-300 text-white placeholder:text-gray-400'
                                : '!border !border-gray-300 bg-white text-gray-900'}`}
                            required
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        />
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className={`flex items-center justify-end gap-3 ${theme === 'dark' ? '!bg-textColor-300 !text-white !border-t !border-t-textColor-200' : ''}`}>
                <button
                    type="button"
                    className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 w-fit transition ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={onHide}
                >
                    <span className={`select-none font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                        Cancel
                    </span>
                </button>

                <button
                    type="button"
                    className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 w-fit transition ${!isTitleValid || isLoading
                        ? 'cursor-not-allowed text-gray-400'
                        : theme === 'dark'
                            ? 'hover:bg-purple-500/20 text-purple-300'
                            : 'hover:bg-purple-50 text-purple-600'}`}
                    onClick={handleSave}
                    disabled={!isTitleValid || isLoading}
                >
                    {isLoading ? <LoadingSpinner isSmall /> : <span className={`select-none font-medium`}>
                        Save title
                    </span>}
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default BlogTitleUpdaterModal;