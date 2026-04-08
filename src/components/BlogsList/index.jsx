import React, { useContext, useEffect, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';
import BaseHeading from '../BaseHeading';
import { searchByKey, sortByKey } from '../../utils';

const BlogsList = () => {

    const {
        blogs,
        setSelectedBlog,
        theme
    } = useContext(MainContext);

    const [searchValue, setSearchValue] = useState("");
    const [blogsResults, setBlogsResults] = useState(blogs);
    const handleJsonEntitiesSearch = (e) => {
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
        handleJsonEntitiesSearch();
    }, [blogs]);

    function handleBlogClick(blog) {
        setSelectedBlog(blog);
        // setShowJsonEntityModal(true);
    }

    return (
        <>
            {
                (blogs.length > 0 || blogs.length > 0) ? (
                    <>
                        <BaseHeading text="Blogs" />
                        <input
                            className={`py-1 text-sm bg-transparent outline-none ${theme === 'light' ? '!border !border-textColor-100' : '!border !border-textColor-200 text-textColor-100'} w-full rounded-xl !pl-[10px]`}
                            placeholder={"Search..."}
                            value={searchValue}
                            onChange={handleJsonEntitiesSearch}
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
                    <BaseHeading text="No composers found" className={`text-center mt-4 ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`} />
                )
            }

            {showJsonEntityModal && <KnowledgeGraphModal show={showJsonEntityModal} onHide={() => setShowJsonEntityModal(false)} />}
        </>
    );
};

export default BlogsList;