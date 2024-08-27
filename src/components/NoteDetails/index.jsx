import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import { useContext, useEffect, useRef, useState } from 'react';
import { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Link } from 'react-router-dom';
import toast from 'react-simple-toasts';
import makeApiRequest from '../../api';
import { MainContext } from '../../contexts/mainContext';
import { generateRandomHash, hexToRGBString } from '../../utils';
import AddToStoryModal from '../AddToStoryModal';
import AggregationLlmModal from '../AggregationLlmModal';
import BaseHeading from '../BaseHeading';
import CustomButton from '../CustomButton';

function NoteDetails() {
    const {
        selectedNote,
        setSelectedNote,
        notes,
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

        setActiveView,


        currentResource,
        isNewNote, theme, setShowNoteDetails } = useContext(MainContext);

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
    };

    const handleSave = async (event) => {
        event && event.preventDefault();
        if (selectedNote.note_name === "") {
            // add shadow to toast classnames
            toast('Note title cannot be empty', { className: `p-2 rounded-md`, theme });
            return;
        }
        if (isNewNote && notes.every(n => n.note_name !== selectedNote.note_name)) {
            const dateTimeStr = new Date().toISOString().replace(/:/g, '-').split('.')[0] + Math.random().toString(36).substring(7);

            selectedNote.note_id = dateTimeStr;
        }
        try {
            await makeApiRequest(`/save-note`, 'post', { noteID: selectedNote.note_id, selectedNote, noteName: 'note_json', noteNumber: parseInt(noteIndex), isNewNote: isNewNote });

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
                        keyframeLinks: [],
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
            //         keyframeLinks: [],
            //     pdfLinks: [],
            //     imageLinks: [],
            // }

            if (item.references) {
                if (item.references.videoLinks) {
                    item.references.videoLinks.forEach((link) => {
                        references.add(link);
                    });
                }

                if (item.references.keyframeLinks) {
                    item.references.keyframeLinks.forEach((link) => {
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
            keyframeLinks: [],
            pdfLinks: [],
            imageLinks: [],
        };

        references.map((ref) => {
            if (ref.includes('.mp4')) {
                _refs.videoLinks.push(ref);
                _refs.keyframeLinks.push(ref);
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
                questionImages: selectedImagesInQuestion,
                answer: '',
                model: null,
                color: theme === 'light' ? "#333" : '#fff',
                question: newQuestion,
                references: {
                    videoLinks: [],
                    keyframeLinks: [],
                    pdfLinks: [],
                    imageLinks: [],
                },
                refs: {
                    videoLinks: [],
                    keyframeLinks: [],
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
            newNote.text.at(-1).answerImages = selectedImagesInAnswer;
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
        // setIsNewNote(false);
        setSelectedNote(prev => {
            return { ...prev, note_name: titleRef.current.innerText };
        });
        // titleRef.current.blur();
    }

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
        updateTitle();
        setIsTitleEditing(false);
    }

    return (
        <div className="flex flex-col h-full max-w-6xl mx-auto">
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
                                    keyframeLinks: [],
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
                <h4 className='m-0' onFocus={handleTitleFocus}
                    ref={titleRef} contentEditable suppressContentEditableWarning={true} onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            updateTitle();
                            // handleSave(e);
                        }
                    }}>{selectedNote.note_name}</h4>
                {
                    isTitleEditing && <CheckIcon onClick={changeTitle} className='cursor-pointer' />
                }
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
                                        {typeof item.question === 'string' ? (
                                            <div>
                                                {item?.questionImages?.length > 0 && <div className="flex flex-col gap-3 mb-4">
                                                    {/* list of images */}
                                                    {item?.questionImages?.map((imgBlob, index) => (
                                                        <img className="w-[300px] h-[200px] object-contain" src={imgBlob} alt='img' key={index} />
                                                    )
                                                    )}
                                                </div>}
                                                <p dangerouslySetInnerHTML={{ __html: item.question.replace(/\n/g, '<br>') }} contentEditable suppressContentEditableWarning={true} ref={(el) => (questionRefs.current[item.id] = el)} onFocus={() => handleFocus("question", item.id)}></p>
                                            </div>
                                        ) : (
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
                            <div className='min-w-[50%]'>
                                {
                                    item.answer ? (
                                        <div className='flex items-center gap-2'>
                                            <div className={`flex flex-col  gap-3 py-2 px-3 ${theme === 'light' ? 'bg-light-hover-200' : 'bg-background w-fit rounded-md'} align-self-start max-w-[80%]`}>
                                                {!item.answer.startsWith('https://oaidalleapiprodscus.blob') ? <div>
                                                    {item?.answerImages?.length > 0 && <div className="flex flex-col gap-3 mb-4">
                                                        {/* list of images */}
                                                        {item?.answerImages?.map((imgBlob, index) => (
                                                            <img className="w-[300px] h-[200px] object-contain" src={imgBlob} alt='img' key={index} />
                                                        )
                                                        )}
                                                    </div>}
                                                    <p dangerouslySetInnerHTML={{ __html: item.answer.replace(/\n/g, '<br>') }} contentEditable suppressContentEditableWarning={true} ref={el => (answerRefs.current[item.id] = el)} onFocus={() => handleFocus("answer", item.id)}></p></div> : <img className="w-[400px] h-[300px]" width="400" height="300" src={item.answer} alt="image" />}
                                                {/* display references */}
                                                {(item.refs?.videoLinks?.length > 0 || item.refs?.keyframeLinks?.length > 0 || item.refs?.pdfLinks?.length > 0 || item.refs?.imgLinks?.length > 0) && <div className='flex flex-col gap-2'>
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
                                                            item.refs?.keyframeLinks.map((video) => (
                                                                <li key={video.source_path} className="ml-0">
                                                                    <Link onClick={(event) => handleVideoLinkClick(event, video)}>
                                                                        {video.source_path + " | Keyframe at: " + video.timestamp}
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
                            {/* img placeholders */}
                            <input type="file" multiple onChange={e => handleNewImgSelected(e, 'question')} accept='image/*' />
                            <div className='flex items-center gap-2'>
                                {
                                    selectedImagesInQuestion.map((item, index) => (
                                        <img className='w-10 h-10' src={item} alt="img" key={index} />
                                    ))
                                }
                            </div>
                            <div>
                                <textarea rows='5' className={`w-full h-auto outline-none p-1 ${theme === 'dark' ? '!border !border-textColor-300 bg-black text-textColor-100' : 'border'}`} value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} />
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