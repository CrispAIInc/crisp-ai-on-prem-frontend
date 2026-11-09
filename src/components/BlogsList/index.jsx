// import React, { useContext, useEffect, useState } from 'react';
// import { MainContext } from '../../contexts/mainContext';
// import BaseHeading from '../BaseHeading';
// import { searchByKey, sortByKey } from '../../utils';
// import BlogItem from '../BlogItem';
// import BlogViewerModal from '../BlogViewerModal';

// const BlogsList = () => {

//     const {
//         blogs,
//         setSelectedBlog,
//         theme
//     } = useContext(MainContext);

//     const [searchValue, setSearchValue] = useState("");
//     const [blogsResults, setBlogsResults] = useState(blogs);
//     const handleBlogsSearch = (e) => {
//         const value = e?.target?.value || "";
//         setSearchValue(value);

//         if (value.trim() === "") {
//             setBlogsResults(sortByKey(blogs, "title"));
//         } else {
//             const filtered = searchByKey(blogs, "title", value);
//             setBlogsResults(sortByKey(filtered, "title"));
//         }
//     };

//     useEffect(() => {
//         setBlogsResults(sortByKey(blogs, "title"));
//         handleBlogsSearch();
//     }, [JSON.stringify(blogs)]);

//     const [showBlogModal, setShowBlogModal] = useState(false);

//     function handleBlogClick(blog) {
//         setSelectedBlog(blog);
//         setShowBlogModal(true);
//     }

//     return (
//         <>
//             {
//                 (blogs.length > 0 || blogs.length > 0) ? (
//                     <>
//                         <BaseHeading text="My blogs" />
//                         <input
//                             className={`py-1 text-sm bg-transparent outline-none ${theme === 'light' ? '!border !border-textColor-100' : '!border !border-textColor-200 text-textColor-100'} w-full rounded-xl !pl-[10px]`}
//                             placeholder={"Search..."}
//                             value={searchValue}
//                             onChange={handleBlogsSearch}
//                         />
//                         <div className={`overflow-y-auto h-full [&::-webkit-scrollbar]:h-1
//         [&::-webkit-scrollbar-thumb]:rounded-full ${theme === "light" ? '[&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-neutral-400 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500' : '[&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:bg-neutral-600 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-700'}`}>
//                             {
//                                 blogsResults.map((blog) => (
//                                     <BlogItem key={blog.blog_id} blog={blog} onClick={() => handleBlogClick(blog)} />
//                                 ))
//                             }
//                         </div>
//                     </>
//                 ) : (
//                     <BaseHeading text="No blogs found" className={`text-center mt-4 ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`} />
//                 )
//             }

//             {
//                 showBlogModal && (
//                     <BlogViewerModal show={showBlogModal} onHide={() => setShowBlogModal(false)} />
//                 )
//             }
//         </>
//     );
// };

// export default BlogsList;

import React, { useContext, useMemo, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';
import BaseHeading from '../BaseHeading';
import { searchByKey, sortByKey } from '../../utils';
import BlogItem from '../BlogItem';
import BlogViewerModal from '../BlogViewerModal';
import EmptyState from '../EmptyState';
import BlogsDetails from '../BlogsDetails';
import { FileText, Info } from 'lucide-react';

const BlogsList = ({ compact = false }) => {

    const {
        blogs,
        selectedBlog,
        setSelectedBlog,
        theme
    } = useContext(MainContext);

    const [searchValue, setSearchValue] = useState("");
    const [showBlogModal, setShowBlogModal] = useState(false);
    const blogsResults = useMemo(() => {
        const filteredBlogs = searchValue.trim()
            ? searchByKey(blogs, "title", searchValue)
            : blogs;
        return sortByKey(filteredBlogs, "title");
    }, [blogs, searchValue]);

    function handleBlogClick(blog) {
        setSelectedBlog(blog);
        if (compact) setShowBlogModal(true);
    }

    if (compact) {
        return (
            <>
                {blogs.length > 0 ? (
                    <>
                        <BaseHeading text="My blogs" />
                        <input
                            className={`py-1 text-sm bg-transparent outline-none ${theme === 'light' ? '!border !border-textColor-100' : '!border !border-textColor-200 text-textColor-100'} w-full rounded-xl !pl-[10px]`}
                            placeholder="Search..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                        <div className={`overflow-y-auto h-full [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full ${theme === "light" ? '[&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-neutral-400 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500' : '[&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:bg-neutral-600 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-700'}`}>
                            {blogsResults.map((blog) => (
                                <BlogItem key={blog.blog_id} blog={blog} onClick={handleBlogClick} />
                            ))}
                        </div>
                    </>
                ) : (
                    <BaseHeading text="No blogs found" className={`text-center mt-4 ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`} />
                )}

                {showBlogModal && selectedBlog && (
                    <BlogViewerModal show={showBlogModal} onHide={() => setShowBlogModal(false)} />
                )}
            </>
        );
    }

    return (
        <div className="h-full min-h-0 flex overflow-hidden">
            <div className="w-[280px] shrink-0 border-r border-border h-full min-h-0 overflow-y-auto p-3 flex flex-col gap-2">
                {blogs.length === 0 ? (
                    <EmptyState
                        icon={<Info size={20} />}
                        title="No blogs found"
                        description="Use the left panel to start generating blogs."
                    />
                ) : (
                    <>
                        <input
                            aria-label="Search blogs"
                            className="w-full rounded-lg border border-border bg-white px-2.5 py-2 text-[12.5px] text-ink outline-none focus:border-primary"
                            placeholder="Search blogs..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                        <div className="flex flex-col gap-1">
                            {blogsResults.map((blog) => (
                                <BlogItem
                                    key={blog.blog_id}
                                    blog={blog}
                                    active={blog.blog_id === selectedBlog?.blog_id}
                                    onClick={handleBlogClick}
                                />
                            ))}
                            {blogsResults.length === 0 && (
                                <p className="px-2 py-3 text-center text-xs text-ink-muted">No matching blogs.</p>
                            )}
                        </div>
                    </>
                )}
            </div>

            <div className="flex-1 min-w-0 h-full min-h-0 overflow-y-auto">
                {!selectedBlog ? (
                    <EmptyState
                        icon={<FileText size={20} />}
                        title="Select a Blog"
                        description="Pick a blog from the list to preview it and see its details."
                        twClasses="h-full"
                    />
                ) : (
                    <BlogsDetails />
                )}
            </div>
        </div>
    );
};

export default BlogsList;