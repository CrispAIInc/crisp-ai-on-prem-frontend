import React, { useContext, useState, useEffect, useRef } from 'react';
import { MainContext } from '../../contexts/mainContext';
import BaseHeading from '../BaseHeading';
import CustomInput from '../CustomInput';
import ReactQuill from 'react-quill';
import CustomButton from '../CustomButton';

import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import makeApiRequest from '../../api';
import toast from 'react-simple-toasts';
import 'react-simple-toasts/dist/theme/dark.css';
import 'react-simple-toasts/dist/theme/light.css';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { areArraysEqual, generateRandomHash, getLevelOfSection, isSameStoryContent, transformArrayOfObjectsToArray, transformString } from '../../utils';
import LoadingSpinner from '../LoadingSpinner';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import DynamicComponent from '../DynamicComponent';
import CheckIcon from '@mui/icons-material/Check';
import ReactDOM from 'react-dom';
import { Link } from "react-router-dom";

function StoryDetails() {

    const { setSelectedStory, selectedStory, setActiveView, currentResource,
        modules, theme, stories,
        formats, setStories, isNewStory, setIsNewStory, selectedGenStoriesModels, selectedSources, API_ENDPOINT,
        setCurrentResource,
        setResourceURL,
        setSummary,
        setSummaries,
        setJumpToPage, } = useContext(MainContext);

    const [HTMLToDisplay, setHTMLToDisplay] = useState('');
    const [isGeneratingIntroConclusion, setIsGeneratingIntroConlusion] = useState(false);
    const newStoryContent = useRef('');


    // useEffect(() => {
    //     if (selectedStory.text) {
    //         const htmlString = selectedStory.text.map(item => {
    //             const headingLevel = getLevelOfSection(item.outline.name);
    //             const outlineHtml = `<h${headingLevel} style='font-style: italic; font-weight: 700;'>${item.outline.name}</h${headingLevel}>`;
    //             const contentHtml = item.content;

    //             return `
    //                     <span style="color: ${theme === 'light' ? '#333' : '#ABAEB4'};">
    //                         ${outlineHtml}
    //                         ${contentHtml}
    //                     </span>
    //                 `;
    //         }).join('<br />');
    //         setHTMLToDisplay(htmlString);
    //     }
    // }, [selectedStory.text, selectedStory.text.length, theme]);

    // const handleContentChange = (newContent) => {
    //     if (isNewStory) {
    //         newStoryContent.current = newContent;
    //         selectedStory.text = transformString(newContent);
    //     }
    // };

    const handleSave = async () => {
        if (!selectedStory.story_name) {
            toast('Story title cannot be empty', { className: 'p-2 rounded-md', theme });
            return;
        }

        // let text = null;
        // if (isNewStory) {
        //     text = transformString(newStoryContent.current);
        //     setSelectedStory((prev) => ({ ...prev, text }));
        // }

        // const story = stories.find((story) => story.story_name.trim().toLowerCase() === selectedStory.story_name.trim().toLowerCase());
        // if (story) {
        //     toast('Story already exists', { className: 'p-2 rounded-md', theme });
        //     return;
        // }

        try {
            const story = stories.find(story => story.story_id === selectedStory.story_id);
            if (!story) {
                await makeApiRequest('/stories', 'post', { ...selectedStory });
            } else {
                // if (stories.find(story => story.story_name.trim().toLowerCase() === selectedStory.story_name.trim().toLowerCase() && isSameStoryContent(story.text, selectedStory.text))) {
                //     toast('Story with the same title already exists', { className: 'p-2 rounded-md', theme });
                //     return;
                // }
                await makeApiRequest(`/stories/${selectedStory.story_id}`, 'put', selectedStory);
            }
            const data = await makeApiRequest("/stories", "get");
            setStories(data);
            toast('Story saved successfully', { className: 'p-2 rounded-md', theme });
        } catch (error) {
            console.log(error);
            toast('An error occurred while saving story', { className: 'p-2 rounded-md', theme });
        }
    };

    async function autoGenerateStory() {
        if (!isNewStory) {
            setIsGeneratingIntroConlusion(true);

            const httpPayload = {
                story_sections_titles: transformArrayOfObjectsToArray(selectedStory.text),
                outline_title: selectedStory.story_name,
                llm_model: selectedGenStoriesModels[0],
                with_selected_sources: selectedSources.length > 0
            };
            try {
                const { sections } = await makeApiRequest('/auto-generate-story', 'post', httpPayload);

                setSelectedStory(prev => {
                    prev.text.forEach((textItem, index) => {
                        textItem.content = sections[index];
                    });

                    return prev;
                });
            }
            catch (error) {
                console.log(error);
            } finally {
                setIsGeneratingIntroConlusion(false);
            }
        }
    }
    // async function generateIntroConclusion() {
    //     if (!isNewStory) {
    //         setIsGeneratingIntroConlusion(true);
    //         // get text of selectedStory except for introduction and conclusion sections
    //         let content = "";
    //         for (let i = 0; i < selectedStory.text.length; i++) {
    //             if (selectedStory.text[i].outline.name.toLowerCase().includes('introduction')) continue;
    //             if (selectedStory.text[i].outline.name.toLowerCase().includes('conclusion')) break;
    //             content += '\n' + selectedStory.text[i].outline.name + '\n' + selectedStory.text[i].content;
    //         }

    //         const httpPayload = {
    //             content
    //         };
    //         try {
    //             const { introduction, conclusion } = await makeApiRequest(`/generate-intro-outro/${selectedStory.models[0]}`, 'post', httpPayload);

    //             setSelectedStory((prev) => {
    //                 const updatedStory = { ...prev };

    //                 updatedStory.text[0] = { ...updatedStory.text[0], content: introduction + '<br />' };

    //                 // Loop through the text array and update content where outline.name contains "conclusion"
    //                 updatedStory.text = updatedStory.text.map((textItem) => {
    //                     if (textItem.outline?.name?.toLowerCase().includes("conclusion")) {
    //                         return { ...textItem, content: conclusion + '<br />' };
    //                     }
    //                     return textItem;
    //                 });

    //                 return updatedStory;
    //             });
    //         } catch (error) {
    //             console.log(error);
    //         } finally {
    //             setIsGeneratingIntroConlusion(false);
    //         }
    //     }
    // }

    const deleteStory = async (id) => {
        try {
            await makeApiRequest(`/stories/${id}`, 'delete');
            setSelectedStory({
                story_id: "",
                text: [],
                story_name: "new story...",
                models: []
            });
            setActiveView(null);

            // fetch stories
            const data = await makeApiRequest("/stories", "get");
            setStories(data);
            toast('Story deleted successfully', { className: 'p-2 rounded-md', theme });
        } catch (error) {
            console.log(error);
            toast('An error occurred while deleting story', { className: 'p-2 rounded-md', theme });
        }
    };

    const handleCloseStory = () => {
        setSelectedStory({
            story_id: "",
            text: [],
            story_name: "",
            models: []
        });
        setActiveView(() => {
            if (currentResource) {
                return 'resource';
            }
            if (selectedStory.note_id !== '') {
                console.log("hehe");
                return 'note';
            }
            return null;
        });
        setIsNewStory(false);
    };

    const [newQuestion, setNewQuestion] = useState('');
    const [currentAddingQuestionId, setCurrentAddingQuestionId] = useState("");
    const [currentAddingAnswerId, setCurrentAddingAnswerId] = useState("");
    const [newAnswer, setNewAnswer] = useState('');
    const titleRef = useRef(null);


    function handleOpenNewQuestionBox(id) {
        setCurrentAddingQuestionId(id);
    }
    function handleOpenNewAnswerBox(id) {
        setCurrentAddingAnswerId(id);
    }

    const questionRefs = useRef({});
    const answerRefs = useRef({});

    function handleDeleteContent(id) {
        setSelectedStory((prev) => {
            const updatedStory = { ...prev };
            updatedStory.text = updatedStory.text.filter((item) => item.id !== id);
            return updatedStory;
        });
    }

    function handleAddSectionAnswer(id) {
        setSelectedStory(prev => {
            const newStory = { ...prev };
            newStory.text.find(t => t.id === id).content = newAnswer;

            return newStory;
        });
        setNewAnswer("");
    }

    function addNewQuestion() {
        if (newQuestion === '') {
            return;
        }
        setSelectedStory(prev => {
            const newStory = { ...prev };
            newStory.text.push({
                id: generateRandomHash(5),
                content: "",
                outline: {
                    id: generateRandomHash(5),
                    name: newQuestion
                },
                sectionImages: selectedImagesInQuestion
            });
            return newStory;
        });
        setNewQuestion('');
        setCurrentAddingQuestionId("");
        // handleSave(e);
    }

    function addNewAnswer() {
        if (newAnswer === '') {
            return;
        }

        if (selectedStory.text.at(-1).content) return;

        setSelectedStory(prev => {
            const newStory = { ...prev };
            newStory.text.at(-1).answer = newAnswer;
            newStory.text.at(-1).contentImages = selectedImagesInAnswer;
            return newStory;
        });
        setNewAnswer('');
        setCurrentAddingAnswerId("");
        // handleSave(e);
    }

    const [currentAnswerRef, setCurrentAnswerRef] = useState("");
    const [currentRefType, setCurrentRefType] = useState('');

    const [currentEditable, setCurrentEditable] = useState(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (currentEditable && !Object.values(currentRefType === "question" ? questionRefs.current : currentRefType === "answer" ? answerRefs.current : currentRefType === "answerWithReference" ? answerWithReferenceRefs.current : titleRef.current).includes(event.target)) {
                fireFunction();
                setCurrentEditable(null);
            }
        };

        if (currentEditable) {
            document.addEventListener('click', handleClickOutside);
        } else {
            document.removeEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [currentEditable, currentRefType]);

    const fireFunction = () => {
        console.log("clicked outside");
        if (currentRefType === "question") {
            updateSection(currentEditable);
        } else if (currentRefType === "answer") {
            updateResponse(currentEditable);
        } else if (currentRefType === "answerWithReference") {
            // updatedAnswerWithReference(currentEditable, currentAnswerRef);
        }
        else {
            updateTitle();
        }
    };

    const handleFocus = (type, id, answerIndex) => {
        setCurrentRefType(type);
        setCurrentEditable(id);
        if (answerIndex)
            setCurrentAnswerRef(answerIndex);
        // if (id === -1) return;
    };

    function updateResponseWithReference(id, content) {
        console.log(id, content);
        setIsNewStory(false);
        setSelectedStory(prev => {
            const newStory = { ...prev };
            newStory.text.find((note) => note.id === id).content.find(c => c.id === currentAnswerRef).answer = content;
            return newStory;
        });
        // answerWithReferenceRefs.current[id].blur();
    }

    function updateSection(id) {
        setIsNewStory(false);
        // update outline name
        setSelectedStory(prev => {
            const newStory = { ...prev };
            newStory.text.find((note) => note.id === id).outline.name = questionRefs.current[id].innerText;
            return newStory;
        });
        questionRefs.current[id].blur();
    }

    function updateResponse(id) {
        setIsNewStory(false);
        // update content
        setSelectedStory(prev => {
            const newStory = { ...prev };
            newStory.text.find((note) => note.id === id).content = answerRefs.current[id].innerText;
            return newStory;
        });
        answerRefs.current[id].blur();
    }

    function updateTitle() {
        console.log("updating title...");
        setIsNewStory(false);
        setSelectedStory(prev => ({ ...prev, story_name: titleRef.current.innerText }));
        // titleRef.current.blur();
    }

    // const reactElement = createElementFromObject(elementObject);

    const [selectedImagesInQuestion, setSelectedImagesInQuestion] = useState([]);
    const [selectedImagesInAnswer, setSelectedImagesInAnswer] = useState([]);

    function handleNewImgSelected(e, type) {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const urls = files.map(file => URL.createObjectURL(file));
            type === "question" ? setSelectedImagesInQuestion(prev => [...prev, ...urls]) : setSelectedImagesInAnswer(prev => [...prev, ...urls]);
        }
    }

    const [isTitleEditing, setIsTitleEditing] = useState(false);
    function handleTitleFocus() {
        setIsTitleEditing(true);
    }
    function changeTitle() {
        console.log("change");
        updateTitle();
        setIsTitleEditing(false);
    }

    const handleVideoLinkClick = (event, video) => {
        event.preventDefault();
        // setFromChat(true);
        const resourceURL = `${API_ENDPOINT}/${video.file_type
            }/all/${encodeURIComponent(video.source_path)}`;
        setCurrentResource(video);
        setResourceURL(resourceURL);
        setSummary(video.summary);
        setSummaries(video.topic_summaries);
        setActiveView('resource');
        // setShowNoteDetails(false);
    };

    const handlePDFLinkClick = (event, pdf) => {
        event.preventDefault();
        const resourceURL = `${API_ENDPOINT}/${pdf.file_type
            }/all/${encodeURIComponent(pdf.source_path)}`;
        setCurrentResource(pdf);
        setResourceURL(resourceURL);
        setSummary(pdf.summary);
        setSummaries(pdf.topic_summaries);
        setActiveView('resource');
        setJumpToPage({ page: parseInt(pdf.page) + 1 });
        // setShowNoteDetails(false);
    };

    const answerWithReferenceRefs = useRef({});

    return (
        <div className="flex flex-col h-full max-w-6xl mx-auto mt-3">
            <div className='flex items-center justify-between'>
                {/*intro/conc generation */}
                {selectedStory.text.length > 0 && <div
                    className={`user-select-none flex items-center justify-center gap-2 px-1 py-1 rounded-md cursor-pointer w-fit text-sm ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={() => autoGenerateStory()}
                >
                    <AutoAwesomeOutlinedIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'} ${isGeneratingIntroConclusion && 'flex items-center gap-2'}`}>
                        {isGeneratingIntroConclusion ? (
                            <>
                                <LoadingSpinner videoSpinner={true} /> <span>Generating Story...</span>
                            </>
                        ) : 'Auto generate story'}
                    </span>
                </div>}
                {/* close button */}
                <div className='flex items-center justify-end'>
                    <BaseHeading text='close' className='cursor-pointer user-select-none' onClick={handleCloseStory} />
                </div>
            </div>

            {/* title */}
            <div className={`mt-2 mb-5 flex items-end gap-3 ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                <h3 className='m-0'>Title:</h3>
                <h4 className='m-0' onFocus={handleTitleFocus} ref={titleRef} contentEditable suppressContentEditableWarning={true} onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        updateTitle();
                    }
                }}>{selectedStory.story_name}</h4>
                {
                    isTitleEditing && <CheckIcon onClick={changeTitle} className='cursor-pointer' />
                }
            </div>


            <div className={`overflow-y-auto flex-1 flex flex-col gap-4 ${theme === 'light' ? 'text-textColor-300' : 'text-light-hover-100'}`}>
                {selectedStory.text?.map((item, textIndex) => (
                    <div key={item.id} className="flex flex-col gap-4 px-3">
                        {/* question */}
                        {
                            item.outline.name ?
                                <div>
                                    <div className='flex items-center gap-2'>
                                        <div className={`py-1 px-3 w-fit rounded-md ${theme === 'light' ? 'bg-white border border-slate-200' : 'bg-textColor-300'}`}>
                                            {/* displaying imgs */}
                                            {item?.sectionImages?.length > 0 && <div className="flex flex-col gap-3 mb-4">
                                                {item?.sectionImages?.map((imgBlob, index) => (
                                                    <img className="w-[300px] h-[200px] object-contain" src={imgBlob} alt='img' key={index} />
                                                )
                                                )}
                                            </div>}
                                            <div contentEditable dangerouslySetInnerHTML={{ __html: item.outline.name.replace(/\n/g, '<br>') }} suppressContentEditableWarning={true} ref={(el) => (questionRefs.current[item.id] = el)} onFocus={() => handleFocus("question", item.id)} ></div>
                                        </div>
                                        <div className="flex gap-2">
                                            <CloseIcon fontSize="2" className='cursor-pointer' onClick={() => handleDeleteContent(item.id)} />
                                        </div>
                                    </div>
                                </div>
                                : null
                        }
                        {/* answer */}
                        <div className='flex items-center gap-4'>
                            <div className='min-w-[50%]'>
                                {
                                    item.content ? (
                                        <div className='flex items-center gap-2'>
                                            <div className={`w-fit rounded-md flex flex-col  gap-3 py-2 px-3 ${theme === 'light' ? 'bg-slate-200' : 'bg-background'} align-self-start w-fit max-w-[95%]`}>
                                                {typeof item.content === 'string' ?
                                                    <>
                                                        {item?.contentImages?.length > 0 && <div className="flex flex-col gap-3 mb-4">
                                                            {/* list of images */}
                                                            {item?.contentImages?.map((imgBlob, index) => (
                                                                <img className="w-[300px] h-[200px] object-contain" src={imgBlob} alt='img' key={index} />
                                                            )
                                                            )}
                                                        </div>}
                                                        <p dangerouslySetInnerHTML={{ __html: item.content.replace(/\n/g, '<br>') }} contentEditable suppressContentEditableWarning={true} ref={el => (answerRefs.current[item.id] = el)} onFocus={() => handleFocus("answer", item.id)} ></p></> : (
                                                        <>
                                                            {/* <div ref={el => (answerRefs.current[item.id] = el)} onFocus={() => handleFocus("answer", item.id)}>{renderElement(item.content)}</div> */}
                                                            {
                                                                item.content.map((i, index) => {
                                                                    return (
                                                                        <div key={index}>
                                                                            {/* single answer */}
                                                                            <div className='flex items-center gap-2'>
                                                                                <p dangerouslySetInnerHTML={{ __html: i.answer.replace(/\n/g, '<br>') }} contentEditable suppressContentEditableWarning={true} ref={el => (answerWithReferenceRefs.current[item.id] = el)} onFocus={() => {
                                                                                    setCurrentAnswerRef(i.id);
                                                                                }} onBlur={(e) => updateResponseWithReference(item.id, e.target.innerText)}></p>
                                                                                {currentAnswerRef === i.id && <CheckIcon onClick={() => updateResponseWithReference(textIndex)} className='cursor-pointer' />}
                                                                            </div>
                                                                            {(i.videosArr?.length > 0 || i.pdfsArr?.length > 0) && (
                                                                                <div>
                                                                                    <p className="m-0">References:</p>
                                                                                    {i.videosArr?.length > 0 && (
                                                                                        <ul className="pl-1 text-sm break-all truncate whitespace-normal">
                                                                                            {i.videosArr.map((video, index) => (
                                                                                                <Link key={index} onClick={(event) => handleVideoLinkClick(event, video)}>
                                                                                                    {video.source_path + " | Timestamp: " + video.timestamp}
                                                                                                </Link>
                                                                                            ))}

                                                                                        </ul>
                                                                                    )}
                                                                                    {i.pdfsArr?.length > 0 && (
                                                                                        <ul className="pl-1 text-sm break-all truncate whitespace-normal">
                                                                                            {i.pdfsArr.map((pdf, index) => (
                                                                                                <Link key={index}>
                                                                                                    {pdf.source_path + " | Page: " + (parseInt(pdf.page) + 1)}
                                                                                                </Link>
                                                                                            ))}
                                                                                        </ul>
                                                                                    )}
                                                                                    {i.imgsArr?.length > 0 && (
                                                                                        <ul className="pl-1 text-sm break-all truncate whitespace-normal">
                                                                                            {i.imgsArr.map((img, index) => (
                                                                                                <Link key={index}>
                                                                                                    {img.source_path}
                                                                                                </Link>
                                                                                            ))}
                                                                                        </ul>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })
                                                            }
                                                        </>
                                                    )}
                                            </div>
                                            {/* <div className="flex gap-2">
                                                <CloseIcon fontSize="2" className='cursor-pointer' onClick={() => handleDeleteContent(item.id)} />
                                            </div> */}
                                        </div>) : currentAddingAnswerId !== item.id ? (
                                            <div className={`flex items-center justify-center py-1 px-3 ${theme === 'light' ? 'bg-slate-200' : 'bg-background rounded-md'} align-self-start cursor-pointer`}
                                                onClick={() => { setNewAnswer(''); handleOpenNewAnswerBox(item.id); }}>
                                                <AddIcon fontSize='small' />
                                            </div>
                                        ) : (
                                        <div className="flex flex-col">
                                            <div>
                                                <textarea rows='5' className={`w-full h-auto outline-none p-1 ${theme === 'dark' ? '!border !border-textColor-300 bg-black text-textColor-100' : 'border'}`} placeholder='Answer' value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} />
                                            </div>
                                            <div className="flex items-center justify-end gap-2">
                                                <CustomButton className='my-0' onClick={() => { setNewAnswer(""); setCurrentAddingAnswerId(""); }}>Cancel</CustomButton>
                                                <CustomButton className='my-0' onClick={() => handleAddSectionAnswer(item.id)}>Save</CustomButton>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                ))}

                {/* add new question/answer */}
                <div className="flex flex-col gap-4 px-3 mt-2">
                    {!currentAddingQuestionId ? <div className={`flex items-center  gap-3 py-1 px-3 ${theme === 'light' ? 'bg-light-hover-200' : 'bg-textColor-300 w-fit rounded-md'} cursor-pointer`}
                        onClick={handleOpenNewQuestionBox}>
                        <AddIcon fontSize='small' />
                    </div>
                        : <div className="flex flex-col">
                            <div>
                                {/* img placeholders */}
                                <input type="file" multiple onChange={e => handleNewImgSelected(e, 'question')} accept='image/*' />
                                <div className='flex items-center gap-2'>
                                    {
                                        selectedImagesInQuestion.map((item, index) => (
                                            <img className='w-10 h-10' src={item} alt="img" key={index} />
                                        ))
                                    }
                                </div>
                                <textarea rows='5' className={`w-full h-auto outline-none p-1 ${theme === 'dark' ? '!border !border-textColor-300 bg-black text-textColor-100' : 'border'}`} placeholder='Question' value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} />
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <CustomButton className='my-0' onClick={() => setCurrentAddingQuestionId("")}>Cancel</CustomButton>
                                <CustomButton className='my-0' onClick={e => addNewQuestion(e)}>Save</CustomButton>
                            </div>
                        </div>}
                    {!currentAddingAnswerId && !currentAddingQuestionId ? <div className={`flex items-center gap-3 py-1 px-3 ${theme === 'light' ? 'bg-light-hover-200' : 'bg-background w-fit rounded-md'} align-self-start max-w-[80%] cursor-pointer`}
                        onClick={handleOpenNewAnswerBox}>
                        <AddIcon fontSize='small' />
                    </div>
                        : selectedStory?.text.at(-1)?.outline.name !== "" && <div className="flex flex-col">
                            {/* img placeholders */}
                            <input type="file" multiple onChange={e => handleNewImgSelected(e, 'answer')} accept='image/*' />
                            <div className='flex items-center gap-2'>
                                {
                                    selectedImagesInAnswer.map((item, index) => (
                                        <img className='w-10 h-10' src={item} alt="img" key={index} />
                                    ))
                                }
                            </div>
                            <div>
                                <textarea rows='5' className={`w-full h-auto outline-none p-1 ${theme === 'dark' ? '!border !border-textColor-300 bg-black text-textColor-100' : 'border'}`} placeholder='Answer' value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} />
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <CustomButton className='my-0' onClick={() => setCurrentAddingAnswerId("")}>Cancel</CustomButton>
                                <CustomButton className='my-0' onClick={e => addNewAnswer(e)}>Save</CustomButton>
                            </div>
                        </div>}
                </div>
            </div>

            {/* questions/answers */}
            <div className='flex items-center gap-3 ml-auto w-fit'>
                <CustomButton className={`ml-auto ${theme === 'light' ? 'bg-white border border-light-hover-200' : 'text-white bg-black'}`} onClick={() => deleteStory(selectedStory.story_id)}>Delete</CustomButton>
                <CustomButton className={`ml-auto ${theme === 'light' ? 'bg-white border border-light-hover-200' : 'text-white bg-black'}`} onClick={e => handleSave(e)}>Save</CustomButton>
            </div>

            {/* story title
            <div className="my-4">
                <CustomInput className="py-2" placeholder='story title' value={selectedStory.story_name} onChange={(e) => setSelectedStory(prev => ({ ...prev, story_name: e.target.value }))} />
            </div>

            <ReactQuill className='#editor h-auto' theme="snow" value={HTMLToDisplay} onChange={handleContentChange}
                modules={modules}
                formats={formats} />

            <div className="flex items-center justify-end gap-2 mt-2">
                <CustomButton className='bg-primary-300 !my-0' onClick={() => deleteStory(selectedStory.story_id)}><DeleteIcon className='text-white' /></CustomButton>
                <CustomButton onClick={handleSave} className="bg-primary-300 !my-0"> <SaveIcon className='text-white' /> </CustomButton>
            </div> */}
        </div>
    );
}

export default StoryDetails;