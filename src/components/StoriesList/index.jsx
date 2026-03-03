import React, { useContext, useEffect, useState } from 'react';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import DeleteIcon from "@mui/icons-material/Delete";
import BaseHeading from '../BaseHeading';
import LoadingSpinner from '../LoadingSpinner';
import { MainContext } from '../../contexts/mainContext';
import { searchByKey, sortArrayOfObjects, sortBySourcePath } from '../../utils';
import makeApiRequest from '../../api';
import useResources from '../../hooks/useResources';
import { useToast } from '../../contexts/toastContext';
import { ProjectContext } from '../../contexts/projectContext';

function StoriesList({ setShowStoriesEditor }) {

    const { isSharedProject } = useContext(ProjectContext);

    const {
        stories,
        theme,
        setSelectedNote,
        setSelectedStory,
        setIsNewStory,
        setStories
    } = useContext(MainContext);

    const { notify } = useToast();
    const { getStories } = useResources({ setStories });

    // useEffect(() => {
    //     setStoriesResults(sortBySourcePath(stories));
    //   }, [stories]);

    const showSelectedStory = (e, story) => {
        setSelectedNote({
            note_id: "",
            text: [{
                content: "", model: "", color: theme === 'light' ? "#333" : '#fff', question: '', answer: "", references: {
                    videoLinks: [],
                    keyframeLinks: [],
                    pdfLinks: [],
                    imageLinks: [],
                }
            }],
            images: [],
            note_name: "",
        });
        setSelectedStory(story);
        setIsNewStory(false);
        setShowStoriesEditor(true);
    };

    const [hoveredStory, setHoveredStory] = useState(null);
    const handleMouseEnterStory = (id) => {
        setHoveredStory(id);
    };
    const handleMouseLeaveStory = () => {
        setHoveredStory(null);
    };

    const [isStoryDeleting, setIsStoryDeleting] = useState(false);

    async function deleteStory(event, id) {
        event.preventDefault();
        setIsStoryDeleting(true);
        try {
            await makeApiRequest(`/stories/${id}`, 'delete');
            notify({
                variant: "success",
                heading: "Story deleted successfully!",
            });
            setStories(prev => prev.filter(item => item.story_id !== id));
            // fetch stories
            // getStories();
        } catch (error) {
            console.log(error);
            notify({
                variant: "error",
                heading: "Oops!",
                subheading: "An error occurred while deleting story",
            });
        } finally {
            setIsStoryDeleting(false);
        }
    }


    const [storiesSearchValue, setStoriesSearchValue] = useState("");
    const [storiesResults, setStoriesResults] = useState(stories);
    useEffect(() => {
        setStoriesResults(sortBySourcePath(stories));
    }, [stories]);
    const handleStoriesSearch = (e) => {
        const value = e?.target?.value || "";
        setStoriesSearchValue(value);

        if (value.trim() === "") {
            setStoriesResults(sortArrayOfObjects(stories, "story_name"));
        } else {
            const filtered = searchByKey(stories, "story_name", value);
            setStoriesResults(sortArrayOfObjects(filtered, "story_name"));
        }
    };

    useEffect(() => {
        handleStoriesSearch();
    }, [JSON.stringify(stories)]);

    return (
        <div className="flex flex-col overflow-y-auto">
            {(stories?.length > 0 || storiesResults?.length > 0) && (
                <input
                    className={`mt-4 mb-2 py-1 text-sm bg-transparent outline-none ${theme === 'light' ? '!border !border-textColor-100' : '!border !border-textColor-200 text-textColor-100'} w-full  rounded-full !pl-[10px]`} placeholder={"Search..."}
                    value={storiesSearchValue}
                    onChange={handleStoriesSearch}
                />
            )}
            {
                (storiesResults?.length === 0 || stories?.length === 0) ? <BaseHeading text="No stories found" className={`text-center mt-4 ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`} />
                    :
                    storiesResults?.map((story, index) => (
                        <div key={story.story_id} className={`flex items-center gap-2 ${theme === 'light'
                            ? 'hover:bg-textColor-100/10'
                            : 'hover:bg-light-hover-200/20'
                            } cursor-pointer p-2 rounded-md select-none`} onMouseEnter={() => handleMouseEnterStory(story.story_id)} onMouseLeave={handleMouseLeaveStory} onClick={(event) => showSelectedStory(event, story, index)}>
                            <AutoStoriesOutlinedIcon style={{ color: theme === 'light' ? '#333' : '#5293FD' }} />
                            <p className={`font-semibold flex-1 ${theme === "light" ? "text-textColor-300" : "text-textColor-200"
                                }`}>{story.story_name}</p>
                            {
                                !isSharedProject && (
                                    hoveredStory === story?.story_id && (
                                        isStoryDeleting ? <LoadingSpinner isSmall /> : <DeleteIcon
                                            onClick={(event) => { event.stopPropagation(); deleteStory(event, story?.story_id); }}
                                            className="text-red-400 cursor-pointer"
                                        />
                                    )
                                )
                            }
                        </div>
                    ))
            }
        </div>
    );
}

export default StoriesList;