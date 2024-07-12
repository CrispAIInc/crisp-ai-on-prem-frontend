import { useContext, useEffect, useState, useRef, useMemo } from 'react';
import makeApiRequest from '../../api';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import SaveIcon from '@mui/icons-material/Save';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { MainContext } from '../../contexts/mainContext';
import CustomInput from '../CustomInput';
import CustomButton from '../CustomButton';
import BaseHeading from '../BaseHeading';
import { hexToRGBString, extractTextFromHTML, generateRandomHash, isSameInsightQuestions } from '../../utils';
import AggregationLlmModal from '../AggregationLlmModal';
import toast from 'react-simple-toasts';
import AddToStoryModal from '../AddToStoryModal';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { Parser } from "html-to-react";
import { Link } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';

function NoteDetails() {
    const {
        selectedNote,
        setSelectedNote,
        isManualNote,
        noteIndex,
        setCurrentResource,
        setNotes,
        setIsNewNote,
        llmModels,
        setResourceURL,
        setSummary,
        setSummaries,
        setJumpToPage,
        API_ENDPOINT,
        notes,
        setActiveView,
        modules,
        formats,
        currentResource,
        isNewNote, theme, setShowNoteDetails } = useContext(MainContext);

    const [HTMLToDisplay, setHTMLToDisplay] = useState('');
    const [llmAggregation, setLlmAggregation] = useState('gpt-4');
    const [isLlmAggregationModalOpen, setIsAggregationModalOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [isAddingNewQuestion, setIsAddingNewQuestion] = useState(false);

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    var Image = Quill.import('formats/image');
    Image.sanitize = function (url) {
        return url; // You can modify the URL here
    };

    const quillRef = useRef(null);
    // const modules = useMemo(() => ({
    //     clipboard: {
    //         allowed: {
    //             tags: ['a', 'b', 'strong', 'u', 's', 'i', 'p', 'br', 'ul', 'ol', 'li', 'span'],
    //             attributes: ['href', 'rel', 'target', 'class', 'data-id', 'style']
    //         },
    //         keepSelection: true,
    //         substituteBlockElements: true,
    //         magicPasteLinks: true,
    //     },
    // }), []);
    // useEffect(() => {
    //     const options = {
    //         theme: 'snow',
    //         modules: {
    //             clipboard: {
    //                 allowed: {
    //                     tags: ['a', 'b', 'strong', 'u', 's', 'i', 'p', 'br', 'ul', 'ol', 'li', 'span'],
    //                     attributes: ['href', 'rel', 'target', 'class', 'data-id']
    //                 },
    //                 keepSelection: true,
    //                 substituteBlockElements: true,
    //                 magicPasteLinks: true,
    //             },
    //         },
    //     };
    //     if (quillRef.current) {
    //         new Quill(quillRef.current, options);
    //     }
    // }, []);

    // useEffect(() => {
    //     if (selectedNote.text) {
    //         const htmlString = selectedNote.text.map(item => {
    //             const llmColor = llmModels.find((llm) => llm.value === item.model)?.color;
    //             const fallbackColor = isManualNote ? item.color : theme === 'light' ? "#333333" : "#FFFFFF";
    //             return `<span style="color: ${hexToRGBString(llmColor || fallbackColor)}">${item.content}</span>`;
    //         }).join('');
    //         setHTMLToDisplay(htmlString);
    //     }
    // }, [selectedNote.text.length, theme]);


    // useEffect(() => {
    //     if (quillRef.current) {
    //         const quill = quillRef.current.getEditor();
    //         quill.root.addEventListener('click', handleClick);

    //         quill.clipboard.dangerouslyPasteHTML(HTMLToDisplay);
    //         // console.log(quill.root.innerHTML);
    //     }

    //     // Cleanup function to remove event listener when component unmounts
    //     return () => {
    //         if (quillRef.current) {
    //             const quill = quillRef.current.getEditor();
    //             quill.root.removeEventListener('click', handleClick);
    //         }
    //     };
    // }, [HTMLToDisplay]);

    let htmlToReactParser = new Parser();

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

    // const handleClick = (event) => {
    //     let target = event.target;

    //     // Traverse up the DOM tree to find the <li> element
    //     while (target && target.tagName !== 'LI') {
    //         target = target.parentNode;
    //     }

    //     if (target && target.tagName === 'LI') {
    //         const sourceObject = JSON.parse(decodeURIComponent(target.children[0].getAttribute('href')));

    //         switch (sourceObject.file_type) {
    //             case 'video': handleVideoLinkClick(event, sourceObject); break;
    //             case 'pdf': handlePDFLinkClick(event, sourceObject); break;
    //             default: console.log('no file type found');
    //         }
    //         // const id = target.getAttribute('data-id');
    //         // if (id) {
    //         //     console.log('List item clicked:', id);
    //         //     // Call your function here with the id
    //         // } else {
    //         //     console.log('data-id attribute is missing');
    //         // }
    //     }
    // };


    // const handleContentChange = (newContent, delta, source) => {
    //     if (isNewNote && isManualNote) {
    //         selectedNote.text = [{
    //             content: `<span style="color: ${hexToRGBString(theme === 'light' ? "#333" : '#fff')}">${newContent}</span>`,
    //             answer: extractTextFromHTML(newContent),
    //             model: null,
    //             color: theme === 'light' ? "#333" : '#fff',
    //             question: '',
    //             references: {
    //                 videoLinks: [],
    //                 pdfLinks: [],
    //                 imageLinks: [],
    //             }
    //         }];
    //         return;
    //     }

    //     console.log(newContent);
    //     console.log(source)

    //     // if (source === 'user') {
    //     //     setSelectedNote(prev => ({ ...prev, content: newContent }));
    //     // }
    // };

    const handleSave = async (event) => {
        event && event.preventDefault();
        if (selectedNote.note_name === "") {
            // add shadow to toast classnames
            toast('Note title cannot be empty', { className: `p-2 rounded-md`, theme });
            return;
        }
        if (isNewNote) {
            const dateTimeStr = new Date().toISOString().replace(/:/g, '-').split('.')[0] + Math.random().toString(36).substring(7);
            // const noteFilename = `${dateTimeStr}.json`;
            selectedNote.note_id = dateTimeStr;
        }
        // const insight = notes.find((note) => note.note_name.trim().toLowerCase() === selectedNote.note_name.trim().toLowerCase() && isSameInsightQuestions(note.text, selectedNote.text) );
        // if (insight) {
        //     toast('Insight already exists', { className: 'p-2 rounded-md', theme });
        //     return;
        // }
        try {
            await makeApiRequest(`/save-note`, 'post', { noteID: selectedNote.note_id, selectedNote, noteName: 'note_json', noteNumber: parseInt(noteIndex + 1), isNewNote: isNewNote });

            // fetch updated version of notes
            const data = await makeApiRequest("/notes", "post");
            setNotes(() => data);
            toast('Insight saved successfully', { className: 'p-2 rounded-md', theme });
        } catch (error) {
            console.log(error);
        }
    };

    const handleDelete = async () => {
        try {
            await makeApiRequest(`/delete-note`, 'post', { noteID: selectedNote.note_id, noteName: selectedNote.note_name });
            // send request to update notes
            const data = await makeApiRequest("/notes", "post");
            setNotes(data);
            toast('Insight deleted successfully', { className: 'p-2 rounded-md', theme });
        } catch (error) {
            console.log(error);
        } finally {
            setSelectedNote({
                note_id: "",
                text: [{
                    content: "", model: null, color: theme === 'light' ? "#333" : '#fff', question: '', references: {
                        videoLinks: [],
                        pdfLinks: [],
                        imageLinks: [],
                    }
                }],
                images: [],
                note_name: "",
            });
        }
    };

    function extractUniqueAttributes(dataArray) {
        // Initialize empty sets to store unique questions, references, and models
        const questions = new Set();
        const answers = new Set();
        const references = new Set();
        const models = new Set();

        dataArray.forEach((item) => {
            if (item.question) {
                questions.add(item.question);
            }

            if (item.answer) {
                answers.add(item.answer);
            }

            if (item.model) {
                models.add(item.model);
            }

            // references is not an array it's an object like this
            // {
            //     videoLinks: [],
            //     pdfLinks: [],
            //     imageLinks: [],
            // }

            if (item.references) {
                if (item.references.videoLinks) {
                    item.references.videoLinks.forEach((link) => {
                        references.add(link);
                    });
                }

                if (item.references.pdfLinks) {
                    item.references.pdfLinks.forEach((link) => {
                        references.add(link);
                    });
                }

                if (item.references.imageLinks) {
                    item.references.imageLinks.forEach((link) => {
                        references.add(link);
                    });
                }
            }
        });

        // Convert sets to arrays and return them
        return {
            questions: Array.from(questions),
            answers: Array.from(answers),
            references: Array.from(references),
            llm: Array.from(models),
        };
    }

    const aggregateInsight = async () => {
        setIsPending(true);

        let { questions, answers, references } = extractUniqueAttributes(selectedNote.text);

        // insight referencesto be stored inside insight
        let _refs = {
            videoLinks: [],
            pdfLinks: [],
            imageLinks: [],
        };

        references.map((ref) => {
            if (ref.includes('.mp4')) {
                _refs.videoLinks.push(ref);
            } else if (ref.includes('.pdf')) {
                _refs.pdfLinks.push(ref);
            } else if (ref.includes('.png') || ref.includes('.jpg') || ref.includes('.jpeg') || ref.includes('.svg')) {
                _refs.imageLinks.push(ref);
            }
        });

        const payload = {
            questions,
            answers,
            llm: llmAggregation,
        };

        const llmColor = llmModels.find((model) => model.value === llmAggregation)?.color;
        const fallbackColor = theme === 'light' ? '#333' : '#fff';

        try {
            const { aggregated_answer } = await makeApiRequest("/aggregate", "post", { ...payload }, {
                'Content-Type': 'application/json',
            });

            const newNote = {
                note_id: new Date().toISOString().replace(/:/g, '-').split('.')[0],
                note_name: "aggregated insight",
                text: [
                    {
                        content: `<span style='color: ${hexToRGBString(llmColor || fallbackColor)}'>
                                        ${questions.map((question, index) => `<h2 key=${index} style='font-size: 20px; font-weight: bold; font-style: italic;'>${question}</h2>`).join('')}
                                        <p>${aggregated_answer}</p>
                                        <p style='margin-bottom: 0px;'>
                                            <h3 style='font-size: 20px; font-weight: bold; font-style: italic; margin-bottom: 0px;'>references:</h3>
                                            <ul style='list-style-type: none;'>
                                                ${references.map((ref, index) => `<li key=${index}>${ref}</li>`).join('')}
                                            </ul>
                                        </p>
                                    </span>`,
                        answer: aggregated_answer,
                        model: llmAggregation,
                        color: llmColor || fallbackColor,
                        question: questions.join(','),
                        references: _refs,
                        isAggregated: true,
                    }
                ],
                images: [],
            };

            setNotes((prev) => {
                const updatedNotes = [...prev, newNote];
                setSelectedNote(newNote);
                return updatedNotes;
            });
        } catch (error) {
            console.log(error);
        } finally {
            setIsPending(false);
            setIsAggregationModalOpen(false);
        }
    };

    const distinctModels = [];
    const modelSet = new Set();

    selectedNote.text?.forEach(item => {
        if (item.model && !modelSet.has(item.model)) {
            modelSet.add(item.model);
            distinctModels.push(item.model);
        }
    });

    const [newQuestion, setNewQuestion] = useState('');
    const [isAddingNewAnswer, setIsAddingNewAnswer] = useState(false);
    const [newAnswer, setNewAnswer] = useState('');
    const titleRef = useRef(null);


    function handleOpenNewQuestionBox() {
        setIsAddingNewQuestion(true);
    }
    function handleOpenNewAnswerBox() {
        setIsAddingNewAnswer(true);
    }

    function addNewQuestion(e) {
        if (newQuestion === '') {
            return;
        }
        setSelectedNote(prev => {
            const newNote = { ...prev };
            newNote.text.push({
                id: generateRandomHash(5),
                content: newQuestion,
                answer: '',
                model: null,
                color: theme === 'light' ? "#333" : '#fff',
                question: newQuestion,
                references: {
                    videoLinks: [],
                    pdfLinks: [],
                    imageLinks: [],
                }
            });
            return newNote;
        });
        setNewQuestion('');
        setIsAddingNewQuestion(false);
        handleSave(e);
    }

    function addNewAnswer(e) {
        if (newAnswer === '') {
            return;
        }

        if (selectedNote.text.at(-1).answer) return;

        setSelectedNote(prev => {
            const newNote = { ...prev };
            newNote.text.at(-1).answer = newAnswer;
            return newNote;
        });
        setNewAnswer('');
        setIsAddingNewAnswer(false);
        handleSave(e);
    }

    const questionRefs = useRef({});
    const answerRefs = useRef({});

    function handleDeleteContent(id) {
        setSelectedNote(prev => {
            const newNote = {
                ...prev,
                text: prev.text.filter(content => content.id !== id)
            };

            return newNote;
        });
    }

    // useEffect(() => {
    //     // save selectedNote
    //     handleSave();
    // }, []);

    const [currentRefType, setCurrentRefType] = useState('');

    const [currentEditable, setCurrentEditable] = useState(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (currentEditable && !Object.values(currentRefType === "question" ? questionRefs.current : currentRefType === "answer" ? answerRefs.current : titleRef.current).includes(event.target)) {
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
        if (currentRefType === "question") {
            updateQuestion(currentEditable);
        } else if (currentRefType === "answer") {
            updateAnswer(currentEditable);
        } else {
            updateTitle();
        }
    };

    const handleFocus = (type, id) => {
        setCurrentRefType(type);
        setCurrentEditable(id);
        // if (id === -1) return;
    };

    function updateQuestion(id) {
        setIsNewNote(false);
        setSelectedNote(prev => {
            const newNote = { ...prev };
            newNote.text.find((note) => note.id === id).question = questionRefs.current[id]?.innerText;
            return newNote;
        });
        questionRefs.current[id].blur();
    }

    function updateAnswer(id) {
        setIsNewNote(false);
        setSelectedNote(prev => {
            const newNote = { ...prev };
            newNote.text.find((note) => note.id === id).answer = answerRefs.current[id]?.innerText;
            return newNote;
        });
        answerRefs.current[id].blur();
    }

    function updateTitle() {
        setIsNewNote(false);
        setSelectedNote(prev => {
            return { ...prev, note_name: titleRef.current.innerText };
        });
        // titleRef.current.blur();
    }

    return (
        <div className="flex flex-col h-full max-w-3xl mx-auto">
            <div className='flex justify-between'>
                <div>
                    {/* aggregated insights */}
                    <div
                        className={`user-select-none flex items-center justify-center gap-2 px-1 py-1 rounded-md cursor-pointer w-fit text-sm ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                        onClick={() => setIsAggregationModalOpen(true)}
                    >
                        <AutoAwesomeOutlinedIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                        <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                            {isPending ? "Aggregating insight..." : "Aggregate Insight"}
                        </span>
                    </div>

                    {/* add to story */}
                    <div
                        className={`user-select-none flex items-center justify-center gap-2 px-1 py-1 rounded-md cursor-pointer w-fit text-sm ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                        onClick={handleOpen}
                    >
                        <SummarizeOutlinedIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                        <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                            Add to Story
                        </span>

                    </div>
                    <AddToStoryModal open={open} setOpen={setOpen} handleOpen={handleOpen} handleClose={handleClose} />

                    <AggregationLlmModal llmAggregation={llmAggregation} setLlmAggregation={setLlmAggregation} isLlmAggregationModalOpen={isLlmAggregationModalOpen} setIsAggregationModalOpen={setIsAggregationModalOpen} aggregateInsight={aggregateInsight} isPending={isPending} />
                </div>
                <div className='flex items-center justify-end'>
                    <BaseHeading text='close' className='cursor-pointer user-select-none' onClick={() => {
                        setShowNoteDetails(false);
                        setSelectedNote({
                            note_id: "",
                            text: [{
                                content: "", model: null, color: theme === 'light' ? "#333" : '#fff', question: '', references: {
                                    videoLinks: [],
                                    pdfLinks: [],
                                    imageLinks: [],
                                }
                            }],
                            images: [],
                            note_name: "",
                        });
                        setActiveView(() => {
                            if (currentResource) {
                                return 'resource';
                            }
                            return null;
                        });
                    }} />
                </div>
            </div>

            {/* title */}
            <div className={`mt-2 mb-5 flex items-end gap-3 ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                <h3 className='m-0'>Title:</h3>
                <h4 className='m-0' ref={titleRef} contentEditable suppressContentEditableWarning={true} onFocus={() => handleFocus("title", 101)} onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        updateTitle();
                        // handleSave(e);
                    }
                }}>{selectedNote.note_name}</h4>
            </div>
            {/* <div > */}

            {/* questions/answers */}
            <div className={`mb-5 overflow-y-auto ${theme === 'light' ? 'text-textColor-300' : 'text-light-hover-100'}`}>
                {selectedNote.text?.map((item) => (
                    <div key={item.id} className="flex flex-col gap-4 px-3">
                        {/* question */}
                        {
                            item.question ?
                                <div className='flex items-center gap-2 align-self-end'>
                                    <div className="flex gap-2">
                                        <CloseIcon fontSize="2" className='cursor-pointer' onClick={() => handleDeleteContent(item.id)} />
                                    </div>
                                    <div className={`flex items-center gap-3 py-1 px-3 ${theme === 'light' ? 'bg-light-hover-200' : 'bg-textColor-300 w-fit rounded-md'}`}>
                                        {typeof item.question === 'string' ? <p contentEditable suppressContentEditableWarning={true} ref={(el) => (questionRefs.current[item.id] = el)} onFocus={() => handleFocus("question", item.id)} onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                updateQuestion(item.id);
                                                // handleSave(e);
                                            }
                                        }}>{item.question}</p> : (
                                            <div>
                                                <div className="flex flex-col items-center gap-3">
                                                    {/* list of images */}
                                                    {item.question?.imgs_list.map((imgBlob, index) => (
                                                        <img className="w-[300px] h-[200px] object-contain" src={imgBlob} alt='img' key={index} />
                                                    )
                                                    )}
                                                </div>
                                                <p>{item.question?.query}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                : null
                        }
                        {/* answer */}
                        <div className='flex items-center gap-4'>
                            <div className='min-w-28'>
                                {
                                    item.answer ? (
                                        <div className='flex items-center gap-2'>
                                            <div className={`flex flex-col  gap-3 py-2 px-3 ${theme === 'light' ? 'bg-light-hover-200' : 'bg-background w-fit rounded-md'} align-self-start max-w-[80%]`}>
                                                {!item.answer.startsWith('https://oaidalleapiprodscus.blob') ? <p className='' contentEditable suppressContentEditableWarning={true} ref={el => (answerRefs.current[item.id] = el)} onFocus={() => handleFocus("answer", item.id)} onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        updateAnswer(item.id);
                                                        // handleSave(e);
                                                    }
                                                }}>{item.answer}</p> : <img className="w-[400px] h-[300px]" width="400" height="300" src={item.answer} alt="image" />}
                                                {/* display references */}
                                                {(item.refs?.videoLinks.length > 0 || item.refs?.pdfLinks.length > 0 || item.refs?.imgLinks.length > 0) && <div className='flex flex-col gap-2'>
                                                    <h6 className='text-sm'>References:</h6>
                                                    <ul className='break-all'>
                                                        {
                                                            item.refs?.videoLinks.map((video) => (
                                                                <li key={video.source_path} className="ml-0">
                                                                    <Link onClick={(event) => handleVideoLinkClick(event, video)}>
                                                                        {video.source_path + " | Timestamp: " + video.timestamp}
                                                                    </Link>
                                                                </li>
                                                            ))
                                                        }
                                                    </ul>
                                                    <ul className='break-all'>
                                                        {
                                                            item.refs?.pdfLinks.map((pdf) => (
                                                                <li key={pdf.source_path} className="ml-0">
                                                                    <Link onClick={(event) => handlePDFLinkClick(event, pdf)}>
                                                                        {pdf.source_path + " | Page: " + (parseInt(pdf.page) + 1)}
                                                                    </Link>
                                                                </li>
                                                            ))
                                                        }
                                                    </ul>
                                                    <ul className='break-all'>
                                                        {
                                                            item.refs?.imgLinks.map((img) => (
                                                                <li key={img.source_path} className="ml-0">
                                                                    <Link onClick={(event) => handlePDFLinkClick(event, img)}>
                                                                        {img.source_path}
                                                                    </Link>
                                                                </li>
                                                            ))
                                                        }
                                                    </ul>
                                                </div>}
                                            </div>
                                            {/* <div className="flex gap-2">
                                                <DeleteIcon fontSize="small" className='cursor-pointer' onClick={() => handleDeleteContent(item.id)} />
                                            </div> */}
                                        </div>) : null
                                }
                                {item.model && <h6 className='mt-2 text-sm'>{item.model}</h6>}
                            </div>
                        </div>
                    </div>
                ))}
                {/* add new question/answer */}
                <div className="flex flex-col gap-4 px-3 mt-2">
                    {!isAddingNewQuestion ? <div className={`flex items-center align-self-end gap-3 py-1 px-3 ${theme === 'light' ? 'bg-light-hover-200' : 'bg-textColor-300 w-fit rounded-md'} cursor-pointer`}
                        onClick={handleOpenNewQuestionBox}>
                        <AddIcon fontSize='small' />
                    </div>
                        : <div className="flex flex-col">
                            <div>
                                <CustomInput placeholder='Question' value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} />
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <CustomButton className='my-0' onClick={() => setIsAddingNewQuestion(false)}>Cancel</CustomButton>
                                <CustomButton className='my-0' onClick={e => addNewQuestion(e)}>Save</CustomButton>
                            </div>
                        </div>}
                    {!isAddingNewAnswer && !isAddingNewQuestion ? <div className={`flex items-center gap-3 py-1 px-3 ${theme === 'light' ? 'bg-light-hover-200' : 'bg-background w-fit rounded-md'} align-self-start max-w-[80%] cursor-pointer`}
                        onClick={handleOpenNewAnswerBox}>
                        <AddIcon fontSize='small' />
                    </div>
                        : isAddingNewAnswer && selectedNote?.text.at(-1)?.question !== "" && <div className="flex flex-col">
                            <div>
                                <textarea rows='5' className={`w-full h-auto outline-none p-1 ${theme === 'dark' ? '!border !border-textColor-300 bg-black text-textColor-100' : 'border'}`} placeholder='Answer' value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} />
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <CustomButton className='my-0' onClick={() => setIsAddingNewAnswer(false)}>Cancel</CustomButton>
                                <CustomButton className='my-0' onClick={e => addNewAnswer(e)}>Save</CustomButton>
                            </div>
                        </div>}
                </div>
            </div>
            <div className='flex items-center gap-3 ml-auto w-fit'>
                <CustomButton className={`ml-auto ${theme === 'light' ? 'bg-white border border-light-hover-200' : 'text-white bg-black'}`} onClick={() => handleDelete()}>Delete</CustomButton>
                <CustomButton className={`ml-auto ${theme === 'light' ? 'bg-white border border-light-hover-200' : 'text-white bg-black'}`} onClick={e => handleSave(e)}>Save</CustomButton>
            </div>
            {/* <CustomButton className={`ml-auto ${theme === 'light' ? 'bg-white border border-light-hover-200' : 'text-white bg-black'}`} onClick={e => handleSave(e)}>Save</CustomButton> */}
        </div>
    );
}

export default NoteDetails;