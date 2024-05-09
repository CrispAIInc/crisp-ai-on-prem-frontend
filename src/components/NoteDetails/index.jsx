import { useContext, useEffect, useState, useRef } from 'react';
import makeApiRequest from '../../api';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from '@mui/icons-material/Save';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { MainContext } from '../../contexts/mainContext';
import CustomInput from '../CustomInput';
import CustomButton from '../CustomButton';
import BaseHeading from '../BaseHeading';
import { hexToRgb } from '@mui/material';
import { renderToString } from "react-dom/server";
import { isNoteFull } from '../../utils';

function NoteDetails() {
    const {
        selectedNote,
        setSelectedNote,
        isManualNote, setIsManualNote,
        noteIndex,
        setNotes,
        setActiveView,
        noteReferences,
        currentResource,
        isNewNote, theme, setShowNoteDetails } = useContext(MainContext);

    const [HTMLToDisplay, setHTMLToDisplay] = useState('');
    const [editorContent, setEditorContent] = useState('');

    useEffect(() => {
        if (selectedNote.text) {
            // setSelectedNote(prev => ({ ...prev, text: [...selectedNote.text, [{ content: "", model: null, color: theme === "light" ? "#333" : "#fff" }]] }));
            const htmlString = selectedNote.text.map(item => `<span style="color: ${hexToRgb(item.color)} !important;">${item.content}</span>`).join('');
            // console.log(htmlString);
            setHTMLToDisplay(htmlString);
        }
    }, [selectedNote]);

    // useEffect(() => {
    //     if (selectedNote.text?.length > 0) {
    //         // const updatedText = selectedNote.text.map((text) => {
    //         //     if (!text.model) {
    //         //         text.color = theme === 'light' ? "#333" : "#fff";
    //         //     }
    //         //     return text;
    //         // });
    //         // setSelectedNote({ ...selectedNote, text: updatedText });
    //         setSelectedNote((prev) => {
    //             return {
    //                 ...prev,
    //                 text: prev.text.map((text) => {
    //                     if (!text.model) {
    //                         text.color = theme === 'light' ? "#333" : "#fff";
    //                     }
    //                     return text;
    //                 }),
    //             };

    //         });
    //     }
    // }, [theme]);

    const handleContentChange = (newContent) => {
        const selectedNoteBackup = { ...selectedNote };
        // add new content to the selected note
        if (isNewNote && isManualNote) {
            selectedNote.text = [{
                content: newContent,
                model: null,
                color: theme === 'light' ? "#333" : '#fff',
                question: '',
                references: []
            }];
        }
    };

    const modules = {
        toolbar: [
            [{ header: [1, 2, false] }],
            [{ color: [] }, { background: [] }], // Add color options
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
        ],
    };

    const formats = [
        'header',
        'color', // Ensure color is included in the formats
        'background',
        'bold',
        'italic',
        'underline',
        'list',
        'bullet',
        'link',
        'image',
    ];


    const handleSave = async (event) => {
        event.preventDefault();
        if (isNewNote) {
            const dateTimeStr = new Date().toISOString().replace(/:/g, '-').split('.')[0];
            // const noteFilename = `${dateTimeStr}.json`;
            selectedNote.note_id = dateTimeStr;
        }
        try {
            // setSelectedNote({ ...selectedNote, note_name: currentNoteTitle });
            await makeApiRequest(`/save-note`, 'post', { noteID: selectedNote.note_id, selectedNote, noteName: 'note_json', noteNumber: parseInt(noteIndex + 1), isNewNote: isNewNote });

            // fetch updated version of notes
            const data = await makeApiRequest("/notes", "post");
            setNotes(data);

        } catch (error) {
            console.log(error);
        } finally {
            // setCurrentNoteTitle(selectedNote.note_name);
        }
    };

    const handleDelete = async () => {
        try {
            await makeApiRequest(`/delete-note`, 'post', { noteID: selectedNote.note_id, noteName: selectedNote.note_name });
            // send request to update notes
            const data = await makeApiRequest("/notes", "post");
            setNotes(data);
            // setSelectedNote({
            //     note_id: "",
            //     text: [{ content: "", model: null, color: theme === 'light' ? "#333" : '#fff' }],
            //     images: [],
            //     note_name: "",
            // });
        } catch (error) {
            console.log(error);
        }
        // onHide();
    };

    function extractUniqueAttributes(dataArray) {
        // Initialize empty sets to store unique questions, references, and models
        const questions = new Set();
        const references = new Set();
        const models = new Set();

        dataArray.forEach((item) => {
            if (item.question) {
                questions.add(item.question);
            }

            if (item.model) {
                models.add(item.model);
            }

            if (Array.isArray(item.references)) {
                item.references.forEach((refGroup) => {
                    refGroup.forEach((ref) => {
                        references.add(ref);
                    });
                });
            }
        });

        // Convert sets to arrays and return them
        return {
            questions: Array.from(questions),
            references: Array.from(references),
            models: Array.from(models),
        };
    }

    const aggregateInsight = () => {
        console.log(isNoteFull(selectedNote.text));
        console.log(extractUniqueAttributes(selectedNote.text));
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
            {/* <CancelIcon onClick={() => setShowNoteDetails(false)} color='error' className="ml-auto text-right" /> */}
            <div className='flex items-center justify-end mt-3' onClick={() => {
                setShowNoteDetails(false);
                setSelectedNote({
                    note_id: "",
                    text: [{ content: "", model: null, color: theme === 'light' ? "#333" : '#fff', question: '', references: [] }],
                    images: [],
                    note_name: "",
                });
                setActiveView(() => {
                    if (currentResource) {
                        return 'resource';
                    }
                    return null;
                });
            }}>
                <BaseHeading text='close' className='cursor-pointer user-select-none' />
            </div>


            {/* aggregated insights */}
            <div
                className={`flex items-center justify-center gap-2 px-1 py-1 rounded-md cursor-pointer w-fit text-sm ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                onClick={() => aggregateInsight()}
            >
                <AutoAwesomeOutlinedIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Aggregate insight</span>
            </div>


            <div className="my-4">
                <CustomInput className="py-2" placeholder='Note title' value={selectedNote.note_name} onChange={(e) => setSelectedNote(prev => ({ ...prev, note_name: e.target.value }))} />
            </div>

            <ReactQuill className='#editor h-auto' theme="snow" value={HTMLToDisplay} onChange={handleContentChange}
                modules={modules}
                formats={formats} />
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