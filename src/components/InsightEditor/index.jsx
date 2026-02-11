import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import useReferenceLinkClick from '../../hooks/useReferenceLinkClick';
import RippleButton from '../RippleButton';

import AddIcon from '@mui/icons-material/Add';
import { useToast } from '../../contexts/toastContext';
import useResources from '../../hooks/useResources';
import LoadingSpinner from "../LoadingSpinner";
import { MainContext } from '../../contexts/mainContext';
import { generateRandomHash, htmlToPlainText } from '../../utils';
import makeApiRequest from '../../api';
import JoditEditor from 'jodit-react';

function InsightEditor({ isNewInsight }) {

    const {
        notes,
        isNewNote,
        setNotes,
        selectedNote,
        setSelectedNote,
        noteIndex,
        knowledgeBase,
        theme,
        selectedStory,
    } = useContext(MainContext);

    const { handleSourceLinkClick } = useReferenceLinkClick(true);

    const { notify } = useToast();

    const { getNotes } = useResources({ setNotes });
    const [noteTitle, setNoteTitle] = useState('');

    const [isSavingPending, setIsSavingPending] = useState(false);

    const [value, setValue] = useState('');

    useEffect(() => {
        setNoteTitle(selectedNote?.note_name);
    }, [selectedNote?.note_name]);

    const handleSaveNote = async (event) => {
        setIsSavingPending(true);
        event?.preventDefault();

        if (noteTitle === "" && selectedNote.note_name === "") {
            notify({
                variant: "error",
                heading: "Oops!",
                subheading: "Note title cannot be empty or duplicated.",
            });
            setIsSavingPending(false);
            return;
        }

        // if (isNewInsight && notes.every(n => n.note_name !== selectedNote.note_name)) {
        //     const dateTimeStr = new Date().toISOString().replace(/:/g, '-').split('.')[0] + Math.random().toString(36).substring(7);
        //     selectedNote.note_id = dateTimeStr;
        // }

        try {
            const noteId = new Date().toISOString().replace(/:/g, '-').split('.')[0] + Math.random().toString(36).substring(7);
            await makeApiRequest('/save-note', 'post', {
                noteID: selectedNote.note_id || noteId,
                selectedNote: isNewInsight
                    ? {
                        ...selectedNote,
                        note_id: noteId,
                        note_name: noteTitle,
                        text: [
                            {
                                ...(selectedNote.text?.[0] ?? {}),
                                content: value,
                            }
                        ]
                    }
                    : {
                        ...selectedNote,
                        note_name: noteTitle,
                    },

                noteName: noteTitle,
                noteNumber: parseInt(noteIndex),
                isNewNote: (isNewNote || isNewInsight)
            });

            getNotes();
            notify({
                variant: "success",
                heading: "Insight saved successfully!",
            });
        } catch (error) {
            console.error('Error saving note:', error);
            notify({
                variant: "error",
                heading: "Oops!",
                subheading: "Failed to save insight.",
            });
        } finally {
            setIsSavingPending(false);
        }
    };

    useEffect(() => {
        const handler = e => {
            const li = e.target.closest(".ref-link");
            if (!li) return;


            const raw = li.getAttribute("data-source-object");
            const ref = JSON.parse(
                decodeURIComponent(escape(atob(raw)))
            );

            handleSourceLinkClick(null, ref);
        };

        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);

    function renderRefs(refs = {}) {
        if (Object.keys(refs).every((key) => refs[key]?.length === 0)) return '';

        // return HTML version of refs
        return `
            <div class="refs-block" contenteditable="false">
                <h6 style="margin-top: 5px;">References</h6>
                <ul>
                    ${Object.values(refs)
                .flat()
                .map(ref => {
                    return `
                            <li data-source-object='${btoa(unescape(encodeURIComponent(JSON.stringify(ref))))}' class="ref-link" style="margin-bottom: 0px;">
                                ${ref.source_path} | ${ref.file_type === 'pdf' ? `Page: ${parseInt(ref.page) + 1}` : ref.file_type === 'video' ? `timestamp: ${ref.timestamp}` : ''}
                            </li>
                        `;
                })
                .join("")}
                </ul>
            </div>
        `;
    }

    const initialHTML = useMemo(() => {
        return selectedNote.text
            .map((item, index) => `
            <section class="item-group" data-index="${index}">
                ${item.questionHtml}
                ${item.answerHtml}
                ${item?.refs ? renderRefs(item.refs) : ''}
            </section>
        `)
            .join('<br />');
    }, [selectedNote.note_id, selectedNote.text, renderRefs]);

    useEffect(() => {
        setValue(initialHTML);
    }, [initialHTML]);


    const handleSave = (htmlContent) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const groups = doc.querySelectorAll('.item-group');

        const updatedTextArray = Array.from(groups).map((group, index) => {
            const qText = group.querySelector('.question-block')?.textContent || "";
            const qHtml = group.querySelector('.question-block')?.outerHTML || "";
            const aText = group.querySelector('.answer-block')?.textContent || "";
            const aHtml = group.querySelector('.answer-block')?.outerHTML || "";

            return {
                ...selectedNote.text[index],
                question: qText.trim(),
                questionHtml: qHtml,
                answer: aText.trim(),
                answerHtml: aHtml
            };
        });

        setSelectedNote(prev => ({
            ...prev,
            text: updatedTextArray
        }));

        setNotes(prev => {
            if (prev.length === 0) {
                return [{
                    ...selectedNote,
                    text: updatedTextArray
                }];
            }
            return prev.map(item => {
                if (item.note_id === selectedNote.note_id) {
                    return selectedNote;
                }

                return item;
            });
        });
    };

    const config = useMemo(() => ({
        readonly: false,
        cleanHTML: { fillEmptyParagraph: false },
        allowTags: 'section,div,p,br,hr,style',
        extraAllowedAttributes: ['class', 'style', 'data-index'],
        // Highlighting the "Source" button so you can see the tags being used
        buttons: 'source,bold,italic,underline,font,fontsize,brush,paragraph,ul,ol,hr'
    }), []);

    return (
        <div className="flex-1 h-full z-10 overflow-y-hidden">
            <div className="h-full max-h-full ml-auto overflow-y-hidden flex flex-col">
                <div className="flex items-center justify-between">
                    <RippleButton
                        cssClasses="py-1 pl-2 !pr-3 mb-3 mt-4"
                        onClick={handleSaveNote}
                    >
                        {isSavingPending ? <LoadingSpinner isSmall /> : <AddIcon />}
                        <span className={`${isSavingPending && 'ml-2'} !text-[12px] font-medium`}>
                            Save insight
                        </span>
                    </RippleButton>
                </div>
                <div>
                    <input
                        className={`${theme === 'dark' && 'text-textColor-100'
                            } font-medium p-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-300" : '!border !border-textColor-100'} !outline-none w-full !z-[999999]`}
                        placeholder="New title..."
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                    />
                </div>
                <div className={`${isNewInsight && 'h-full'} overflow-y-hidden`}>

                    {/* <ReactQuill
                        ref={editorRef}
                        theme="snow"
                        value={editorHTML}
                        onChange={(html) => setEditorHTML(html)}
                        className="h-full custom-quill"
                        modules={modules}
                        formats={allowedFormats}
                    /> */}

                    <div className="single-editor-container">
                        <JoditEditor
                            value={value}
                            config={config}
                            onBlur={handleSave} // Saves back to state when you click away
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InsightEditor;