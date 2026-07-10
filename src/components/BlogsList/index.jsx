import React, { useContext, useEffect, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';
import BaseHeading from '../BaseHeading';
import { searchByKey, sortByKey } from '../../utils';
import BlogItem from '../BlogItem';
import BlogViewerModal from '../BlogViewerModal';

const BlogsList = () => {

    const {
        blogs,
        setSelectedBlog,
        theme
    } = useContext(MainContext);

    const [searchValue, setSearchValue] = useState("");
    const [blogsResults, setBlogsResults] = useState(blogs);
    const handleBlogsSearch = (e) => {
        const value = e?.target?.value || "";
        setSearchValue(value);

        if (value.trim() === "") {
            setBlogsResults(sortByKey(blogs, "title"));
        } else {
            const filtered = searchByKey(blogs, "title", value);
            setBlogsResults(sortByKey(filtered, "title"));
        }
    };

    useEffect(() => {
        setBlogsResults(sortByKey(blogs, "title"));
        handleBlogsSearch();
    }, [JSON.stringify(blogs)]);

    const [showBlogModal, setShowBlogModal] = useState(false);

    function handleBlogClick(blog) {
        setSelectedBlog(blog);
        setShowBlogModal(true);
    }

    return (
        <>
            {
                (blogs.length > 0 || blogs.length > 0) ? (
                    <>
                        <BaseHeading text="My blogs" />
                        <input
                            className={`py-1 text-sm bg-transparent outline-none ${theme === 'light' ? '!border !border-textColor-100' : '!border !border-textColor-200 text-textColor-100'} w-full rounded-xl !pl-[10px]`}
                            placeholder={"Search..."}
                            value={searchValue}
                            onChange={handleBlogsSearch}
                        />
                        <div className="overflow-y-auto h-full">
                            {
                                blogsResults.map((blog) => (
                                    <BlogItem key={blog.blog_id} blog={blog} onClick={() => handleBlogClick(blog)} />
                                ))
                            }
                        </div>
                    </>
                ) : (
                    <BaseHeading text="No blogs found" className={`text-center mt-4 ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`} />
                )
            }

            {
                showBlogModal && (
                    <BlogViewerModal show={showBlogModal} onHide={() => setShowBlogModal(false)} />
                )
            }
        </>
    );
};

export default BlogsList;