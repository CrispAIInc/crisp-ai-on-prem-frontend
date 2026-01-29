import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import useReferenceLinkClick from '../../hooks/useReferenceLinkClick';
import RippleButton from '../RippleButton';

import AddIcon from '@mui/icons-material/Add';
import { useToast } from '../../contexts/toastContext';
import useResources from '../../hooks/useResources';
import ReactQuill, { Quill } from 'react-quill';
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

    const { handlePDFLinkClick, handleVideoLinkClick } = useReferenceLinkClick(true);

    const { notify } = useToast();

    const { getNotes } = useResources({ setNotes });
    const [noteTitle, setNoteTitle] = useState('');
    const editorRef = useRef(null);

    const modules = useMemo(() => ({
        toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, true] }],
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image', 'video'],
        ],
        imageResize: {
            parchment: Quill.import("parchment"),
            modules: ["Resize", "DisplaySize", "Toolbar"],
        }
    }), []);

    const allowedFormats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image', 'video',
        'align', 'color', 'background',
        'style', 'section'
    ];

    const [value, setValue] = useState('');

    useEffect(() => {
        setNoteTitle(selectedNote?.note_name);
    }, [selectedNote?.note_name]);

    const handleSaveNote = async (event) => {
        event?.preventDefault();
        if ((!isNewInsight && selectedNote.note_name === "") || (isNewInsight && noteTitle === "")) {
            notify({
                variant: "error",
                heading: "Oops!",
                subheading: "Note title cannot be empty",
            });
            return;
        }

        if ((isNewNote || isNewInsight) && notes.every(n => n.note_name !== selectedNote.note_name)) {
            const dateTimeStr = new Date().toISOString().replace(/:/g, '-').split('.')[0] + Math.random().toString(36).substring(7);
            selectedNote.note_id = dateTimeStr;
        }

        try {
            const noteId = new Date().toISOString().replace(/:/g, '-').split('.')[0] + Math.random().toString(36).substring(7);
            await makeApiRequest('/save-note', 'post', {
                noteID: selectedNote.note_id || noteId,
                selectedNote: isNewInsight ? { ...selectedNote, note_id: noteId, note_name: noteTitle, text: [{ answer: htmlToPlainText(value), content: value, question: "", model: "", id: generateRandomHash(5), references: { videoLinks: [], pdfLinks: [], imageLinks: [] } }] } : { ...selectedNote, note_name: noteTitle },
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
        }
    };

    useEffect(() => {
        const handler = e => {
            const el = e.target.closest('.ref-link');
            if (!el) return;

            const type = el.dataset.refType;
            const index = el.dataset.refIndex;

            console.log('Clicked ref:', type, index);
            // open modal / seek video / open PDF / etc
        };

        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);

    function areRefsEmpty(refs = {}) {
        Object.keys(refs).every((key) => refs[key]?.length === 0);
    }

    function renderRefs(refs = {}) {
        if (areRefsEmpty(refs)) return null;

        // return HTML version of refs
        return `
            <div class="refs-block" contenteditable="false">
                <h6 style="margin-top: 5px;">References</h6>
                <ul>
                    ${Object.values(refs)
                .flat()
                .map(ref => {
                    return `
                            <li class="ref-link" style="margin-bottom: 0px;">
                                ${ref.source_path} | ${ref.file_type === 'pdf' ? `Page: ${ref.page + 1}` : `timestamp: ${ref.timestamp}`}
                            </li>
                        `;
                })
                .join("")}
                </ul>
            </div>
        `;
    }

    const initialHTML = useMemo(() => {
        return selectedNote.text.map((item, index) => `
            <section class="item-group" data-index="${index}">
                ${item.questionHtml}
                ${item.answerHtml}

                ${item?.refs && renderRefs(item.refs)}
            </section>
        `).join('<hr />');
    }, [selectedNote.note_id, renderRefs]);

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
                        <AddIcon />
                        <span className={` !text-[12px] font-medium`}>
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
                    <style>
                        {`
                                .ql-container.ql-snow {
                                    overflow-y: auto !important;
                                }

                                .quill .custom-quill {
                                    overflow-y: hidden !important;
                                    height: 100% !important;
                                }


                                .jodit-react-container,
                                .single-editor-container {
                                    height: 100% !important;
                                }

                                .jodit-container {
                                    display: flex !important;
                                    flex-direction: column !important;
                                    height: 100% !important;
                                    overflow-y: hidden !important;
                                }

                                .jodit-status-bar {
                                    display: none !important;
                                }
                            `}
                    </style>
                    {
                        theme === "light" ? (
                            <style>
                                {`
                    .custom-quill .ql-editor { color: #333 !important; }
                        .ql-toolbar {
                          border-color: #78716C;
                          background-color: rgba(119, 168, 249, 0.2) !important;
                          color: red;
                        }
                        .ql-snow .ql-stroke {
                          stroke: #333 !important;
                        }

                        .ql-picker-label {
                          color: #333 !important;
                        }
                    `}
                            </style>
                        ) : (
                            <style>
                                {`
                    .custom-quill .ql-editor { color: #FFF !important; }
                        .ql-toolbar {
                          border-color: #78716C;
                          background-color: rgba(119, 168, 249, 0.2) !important;
                          color: red;
                        }
                        .ql-snow .ql-stroke {
                          stroke: #fff !important;
                          fill: #fff !important;
                        }

                        .ql-picker-label {
                          color: #fff !important;
                        }
                    `}
                            </style>
                        )
                    }
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
                            value={initialHTML}
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