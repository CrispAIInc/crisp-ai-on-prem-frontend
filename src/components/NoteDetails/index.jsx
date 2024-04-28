import { useContext, useEffect, useState } from 'react';
import makeApiRequest from '../../api';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from '@mui/icons-material/Save';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { MainContext } from '../../contexts/mainContext';
import CustomInput from '../CustomInput';
import CustomButton from '../CustomButton';
import BaseHeading from '../BaseHeading';

function NoteDetails() {

    const {
        selectedNote,
        setSelectedNote,
        noteIndex,
        setNotes,
        setActiveView,
        currentResource,
        isNewNote, theme, setShowNoteDetails } = useContext(MainContext);

    const [HTMLToDisplay, setHTMLToDisplay] = useState('');

    useEffect(() => {
        if (selectedNote.text) {
            const htmlString = selectedNote.text.map(item => `<span style="color: ${item.color};">${item.content}</span>`).join('');
            setHTMLToDisplay(htmlString);
        }
    }, [selectedNote]);

    const handleTextChange = (newHtmlContent) => {
        console.log(newHtmlContent);
        // console.log(newHtmlContent);
        // const htmlString = selectedNote?.text?.map(item => `<span style="color: ${item.color};">${item.content}</span>`).join('');
        // setHTMLToDisplay(htmlString);
        // console.log(newHtmlContent);
        // Update the local state or prepare the content for saving
        // setHTMLToDisplay(newHtmlContent);
        // Array.isArray(selectedNote.text) ? selectedNote.text[selectedNote.text.length - 1].content = newHtmlContent : selectedNote.text = newHtmlContent;
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

    const parseLastElement = (htmlContent) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const childElements = Array.from(doc.body.children);

        // Get the last child element
        const lastElement = childElements[childElements.length - 1];

        if (!lastElement) {
            return null; // Return null if there's no element
        }

        return childElements.map((item) => item.outerHTML).join('');
    };


    const handleSave = async (event) => {
        event.preventDefault();
        if (isNewNote) {
            const dateTimeStr = new Date().toISOString().replace(/:/g, '-').split('.')[0];
            // const noteFilename = `${dateTimeStr}.json`;
            selectedNote.note_id = dateTimeStr;
        }
        try {
            // setSelectedNote({ ...selectedNote, note_name: currentNoteTitle });
            const response = await makeApiRequest(`/save-note`, 'post', { noteID: selectedNote.note_id, selectedNote, noteName: 'note_json', noteNumber: parseInt(noteIndex + 1), isNewNote: isNewNote });
            if (response.status === 200) {
                console.log('selectedNote saved !');
            }

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

    const distinctModels = [];
    const modelSet = new Set();

    selectedNote.text?.forEach(item => {
        if (item.model && !modelSet.has(item.model)) {
            modelSet.add(item.model);
            distinctModels.push(item.model);
        }
    });

    // const [currentNoteTitle, setCurrentNoteTitle] = useState(selectedNote.note_name);

    return (
        <div className="max-w-3xl mx-auto">
            {/* <CancelIcon onClick={() => setShowNoteDetails(false)} color='error' className="ml-auto text-right" /> */}
            <div className='flex items-center justify-end mt-3' onClick={() => {
                setShowNoteDetails(false);
                setSelectedNote({
                    note_id: "",
                    text: [{ content: "", model: null, color: theme === 'light' ? "#333" : '#fff' }],
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
            <div className="my-4">
                <CustomInput className="py-2" placeholder='Note title' value={selectedNote.note_name} onChange={(e) => setSelectedNote(prev => ({ ...prev, note_name: e.target.value }))} />
            </div>

            <ReactQuill className='#editor h-auto' theme="snow" value={HTMLToDisplay} onChange={handleTextChange}
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