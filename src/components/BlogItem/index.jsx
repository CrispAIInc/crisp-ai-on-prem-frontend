import React, { useContext, useState } from 'react';
import ActionMenu from '../ActionMenu';
import LoadingSpinner from '../LoadingSpinner';
import { MainContext } from '../../contexts/mainContext';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import JsonEntityTitleUpdaterModal from '../JsonEntityTitleUpdaterModal';
import makeApiRequest from '../../api';
import { useToast } from '../../contexts/toastContext';

const BlogItem = ({ blog, onClick }) => {

    const {
        theme,
        setBlogs
    } = useContext(MainContext);

    const { notify } = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const { success, message } = await makeApiRequest(`blog/${blog.blog_id}`, 'DELETE');
            if (success) {
                setBlogs(prev => prev.filter(b => b.blog_id !== blog.blog_id));
                notify({
                    variant: 'success',
                    heading: 'Blog deleted',
                });
            }
            else {
                throw new Error(message);
            }
        } catch (error) {
            console.error("Error deleting blog:", error.message);
            notify({
                variant: 'error',
                heading: 'Error deleting blog',
                subheading: error.message || "An error occurred while deleting the blog. Please try again.",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div key={blog.blog_id} className={`flex py-2 items-center rounded-md cursor-pointer ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-700'} transition-colors`}>
                <ActionMenu
                    actions={[
                        {
                            label: "Edit title",
                            icon: <EditOutlinedIcon />,
                            onClick: (e) => {
                                e.stopPropagation();
                                setIsModalOpen(true);
                            },
                        },
                        {
                            label: "Delete",
                            icon: isDeleting ? <LoadingSpinner isSmall /> : <DeleteOutlineOutlinedIcon />,
                            onClick: () => handleDelete(),
                        },
                    ]}
                />
                <p className={`font-semibold ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`} onClick={() => onClick(blog)}>{blog.title}</p>
            </div>

            {
                isModalOpen && (
                    <BlogTitleUpdaterModal show={isModalOpen} onHide={() => setIsModalOpen(false)} blog={blog} />
                )
            }
        </>
    );
};

export default BlogItem;