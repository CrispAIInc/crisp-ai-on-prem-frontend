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
import { hexToRGBString, extractTextFromHTML } from '../../utils';
import AggregationLlmModal from '../AggregationLlmModal';
import toast from 'react-simple-toasts';
import AddToStoryModal from '../AddToStoryModal';

function NoteDetails() {
    const {
        selectedNote,
        setSelectedNote,
        isManualNote,
        noteIndex,
        setCurrentResource,
        setNotes,
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

    useEffect(() => {
        if (selectedNote.text) {
            const htmlString = selectedNote.text.map(item => {
                const llmColor = llmModels.find((llm) => llm.value === item.model)?.color;
                const fallbackColor = isManualNote ? item.color : theme === 'light' ? "#333333" : "#FFFFFF";
                return `<span style="color: ${hexToRGBString(llmColor || fallbackColor)}">${item.content}</span>`;
            }).join('');
            setHTMLToDisplay(htmlString);
        }
    }, [selectedNote, selectedNote.text, selectedNote.text.length, theme]);


    useEffect(() => {
        if (quillRef.current) {
            const quill = quillRef.current.getEditor();
            quill.root.addEventListener('click', handleClick);

            quill.clipboard.dangerouslyPasteHTML(HTMLToDisplay);
            // console.log(quill.root.innerHTML);
        }

        // Cleanup function to remove event listener when component unmounts
        return () => {
            if (quillRef.current) {
                const quill = quillRef.current.getEditor();
                quill.root.removeEventListener('click', handleClick);
            }
        };
    }, [HTMLToDisplay]);

    const handleVideoLinkClick = (event, video) => {
        console.log("hi");
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

    const handleClick = (event) => {
        let target = event.target;

        // Traverse up the DOM tree to find the <li> element
        while (target && target.tagName !== 'LI') {
            target = target.parentNode;
        }

        if (target && target.tagName === 'LI') {
            const sourceObject = JSON.parse(decodeURIComponent(target.children[0].getAttribute('href')));

            switch (sourceObject.file_type) {
                case 'video': handleVideoLinkClick(event, sourceObject); break;
                case 'pdf': handlePDFLinkClick(event, sourceObject); break;
                default: console.log('no file type found');
            }
            // const id = target.getAttribute('data-id');
            // if (id) {
            //     console.log('List item clicked:', id);
            //     // Call your function here with the id
            // } else {
            //     console.log('data-id attribute is missing');
            // }
        }
    };


    const handleContentChange = (newContent) => {
        if (isNewNote && isManualNote) {
            selectedNote.text = [{
                content: `<span style="color: ${hexToRGBString(theme === 'light' ? "#333" : '#fff')}">${newContent}</span>`,
                answer: extractTextFromHTML(newContent),
                model: null,
                color: theme === 'light' ? "#333" : '#fff',
                question: '',
                references: {
                    videoLinks: [],
                    pdfLinks: [],
                    imageLinks: [],
                }
            }];
            return;
        }
    };

    const handleSave = async (event) => {
        event.preventDefault();
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
        const insight = notes.find((note) => note.note_name.trim().toLowerCase() === selectedNote.note_name.trim().toLowerCase() && note.text.length === selectedNote.text.length);
        if (insight) {
            toast('Insight already exists', { className: 'p-2 rounded-md', theme });
            return;
        }
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

    return (
        <div className="max-w-3xl mx-auto">
            <div className='flex items-center justify-end mt-3'>
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


            {/* note title */}
            <div className="my-4">
                <CustomInput className="py-2" placeholder='Note title' value={selectedNote.note_name} onChange={(e) => setSelectedNote(prev => ({ ...prev, note_name: e.target.value }))} />
            </div>

            <div className=''>
                <ReactQuill ref={quillRef} className='#editor h-full' theme="snow" value={HTMLToDisplay} onChange={handleContentChange}
                    modules={modules}
                    formats={formats} />
            </div>
            <div className="flex flex-wrap items-center gap-4 my-1">
                {
                    distinctModels?.map((model, index) => {
                        const modelColor = `bg-${model?.toUpperCase()}-200`;
                        return (
                            <div key={index} className={`flex items-center gap-1 ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-200'}`}>
                                <span className={`w-3 h-3 ${modelColor}`}></span><span>{model?.toUpperCase()}</span>
                            </div>
                        );
                    })
                }
            </div>

            <div className="flex items-center justify-end gap-2">
                <CustomButton className='bg-primary-300 !my-0' onClick={handleDelete}><DeleteIcon className='text-white' /></CustomButton>
                <CustomButton onClick={handleSave} className="bg-primary-300 !my-0"> <SaveIcon className='text-white' /> </CustomButton>
            </div>
        </div>
    );
}

export default NoteDetails;