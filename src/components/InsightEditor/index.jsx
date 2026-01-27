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

function InsightEditor({ isNewInsight }) {

    const {
        notes,
        isNewNote,
        setNotes,
        selectedNote,
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

    const formats = [
        'header',
        'bold',
        'italic',
        'underline',
        'list',
        'bullet',
        'link',
        'image',
    ];

    const [value, setValue] = useState('');

    useEffect(() => {
        setNoteTitle(selectedNote?.note_name);
    }, [selectedNote?.note_name]);

    const handleSave = async (event) => {
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
    const handleReferenceClick = (e, { fileName, fileType }, file) => {

        const _file = file || knowledgeBase?.find(item => item?.source_path === (fileName + "." + fileType));

        if (_file) {
            if (fileType === "mp4") {
                handleVideoLinkClick(e, _file);
            } else {
                handlePDFLinkClick(e, _file);
            }
        }
    };

    function extractFilenameAndType(input) {
        const trimmed = input.split('|')[0].trim(); // Get part before '|'
        const parts = trimmed.split('.');

        if (parts.length < 2) return null; // Invalid format

        const fileType = parts.pop(); // Get extension
        const fileName = parts.join('.'); // Join rest in case filename has dots

        return {
            fileName,
            fileType
        };
    }

    const [editorHTML, setEditorHTML] = useState('');
    useEffect(() => {
        if (!selectedNote?.text) return;
        setEditorHTML(noteTextToHTML(selectedNote.text));
    }, [selectedNote.note_id]);

    function noteTextToHTML(textArr = []) {
        if (!Array.isArray(textArr)) return '';
        return textArr.map(block => {
            const { question, answer, refs = {} } = block;

            const refsHTML = [
                ...(refs.videoLinks || []),
                ...(refs.pdfLinks || []),
                ...(refs.imageLinks || []),
                ...(refs.keyframeLinks || [])
            ]
                .map((ref, i) => `
        <li
          data-ref-type="${ref.file_type}"
          data-ref-index="${i}"
          class="ref-link"
        >
          🔗 ${ref.source_path}
          ${ref.file_type === "video"
                        ? ` (timestamp: ${ref.timestamp})`
                        : ` (page: ${ref.page})`}
        </li>
      `)
                .join('');

            return `
      <section data-block-id="${block.id}">
        <h2><strong>${question}</strong></h2>
        <p>${answer}</p>
        ${refsHTML ? `<ul class="refs">${refsHTML}</ul>` : ''}
      </section>
    `;
        }).join('');
    }


    const html = useMemo(() => {
        if (!selectedNote?.text) return '';
        return noteTextToHTML(selectedNote.text);
    }, [selectedNote?.text]);

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

    function htmlToNoteText(html, prevText = []) {
        if (!html || !Array.isArray(prevText)) return prevText;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        return prevText.map(block => {
            const section = doc.querySelector(
                `section[data-block-id="${block.id}"]`
            );

            if (!section) return block;

            const answerEl = section.querySelector('p');

            console.log({
                ...block,
                answer: answerEl?.innerHTML || block.answer
            });

            return {
                ...block,
                answer: answerEl?.innerHTML || block.answer
            };
        });
    }

    const handleChange = () => {
        setNotes(prev =>
            prev.map(n => {
                if (n.note_id !== selectedNote.note_id) return n;

                return {
                    ...n,
                    text: htmlToNoteText(editorHTML, n.text)
                };
            })
        );
    };




    return (
        <div className="flex-1 h-full z-10 overflow-y-hidden">
            <div className="h-full max-h-full ml-auto overflow-y-hidden flex flex-col">
                <div className="flex items-center justify-between">
                    <RippleButton
                        cssClasses="py-1 pl-2 !pr-3 mb-3 mt-4"
                        onClick={handleSave}
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
                    <ReactQuill
                        ref={editorRef}
                        theme="snow"
                        value={editorHTML}
                        onChange={(html) => setEditorHTML(html)}
                        className="h-full custom-quill"
                        modules={modules}
                        formats={formats}
                    />
                </div>
            </div>
        </div>
    );
}

export default InsightEditor;