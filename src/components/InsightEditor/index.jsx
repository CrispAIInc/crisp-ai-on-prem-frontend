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

    return (
        <div className="flex-1 h-full overflow-y-auto z-10">
            <div className="h-full max-h-full ml-auto overflow-y-auto !overflow-y-hidden flex flex-col">
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
                <div className={`${isNewInsight && 'h-full'}`}>
                    {!isNewInsight && (
                        <style>
                            {`
                    .ql-toolbar.ql-snow + .ql-container.ql-snow {
                      display: none !important;
                    }
                  `}
                        </style>
                    )}
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
                        value={value}
                        onChange={setValue}
                        readOnly={false}
                        className="h-full custom-quill"
                        modules={modules}
                        formats={formats}
                    />
                </div>
                {selectedNote?.note_name !== "" ? <div className={`overflow-y-auto h-full max-h-full space-y-6  !z-10 relative !border ${theme === "dark" ? "!border !border-textColor-300" : '!border !border-textColor-100'}`}>
                    {selectedNote?.text.map((item, index) => (
                        <div
                            key={index}
                            className="pl-2 mb-4"
                        >
                            <h5 className={`z-10 mt-2 font-bold ${theme === "light" ? "text-textColor-300" : "text-textColor-200 text-md"
                                }`}>{typeof item?.question === "string" ? item?.question : item?.question?.query}</h5>
                            <p className={`z-10 text-textColor-200 ${theme === "light" ? "text-textColor-300" : "text-textColor-200"
                                }`} dangerouslySetInnerHTML={{ __html: item?.answer }}></p>

                            {/* PDF Links */}
                            {(item?.references?.pdfLinks?.length > 0 || item?.refs?.pdfLinks?.length > 0) && (
                                <div>
                                    {item[item.refs ? 'refs' : 'references']?.pdfLinks?.map((link, i) => (
                                        <a
                                            key={i}
                                            href="#"
                                            onClick={(e) => handleReferenceClick(e, extractFilenameAndType(typeof link === "string" ? link : link?.source_path), (typeof link === "string" ? null : link))}
                                            className="z-10 mr-2 reference-link"
                                        >
                                            {typeof link === "string" ? link : (link?.source_path + " | " + parseInt(link?.page) + 1)}
                                        </a>
                                    ))}
                                </div>
                            )}

                            {/* Video Links */}
                            {(item?.references?.videoLinks?.length > 0 || item?.refs?.videoLinks?.length > 0) && (
                                <div>
                                    {item[item.refs ? 'refs' : 'references']?.videoLinks?.map((link, i) => (
                                        <li
                                            key={i}
                                            onClick={(e) => handleReferenceClick(e, extractFilenameAndType(typeof link === "string" ? link : link?.source_path), (typeof link === "string" ? null : link))}
                                            className="z-10 mr-2 text-blue-600 break-words list-none cursor-pointer reference-link"
                                        >
                                            {typeof link === "string" ? link : (link?.source_path + " | " + link?.timestamp)}
                                        </li>
                                    ))}
                                </div>
                            )}

                            {/* Image Links */}
                            {(item?.references?.imageLinks?.length > 0 || item?.refs?.imageLinks?.length > 0) && (
                                <div>
                                    {item[item.refs ? 'refs' : 'references']?.imageLinks?.map((link, i) => (
                                        <img
                                            key={i}
                                            src={typeof link === "string" ? link : link?.source_path}
                                            alt="image"
                                            className="z-10 max-w-full mr-2 reference-link"
                                            onClick={(e) => handleReferenceClick(e, typeof link === "string" ? link : link?.source_path, typeof link === "string" ? null : link)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                    :
                    <>
                        {selectedStory.story_name !== "" && <div className={`overflow-y-auto h-full max-h-full space-y-6 !z-10 relative !border bg-red-600 !border-textColor-100`}>
                            <div className={`flex-1 pl-2 !border ${theme === "dark" ? "!border !border-textColor-300" : '!border !border-textColor-100'} overflow-y-auto h-full ${theme === "light" ? "text-textColor-300" : "text-textColor-200"
                                }`}>
                                {
                                    selectedStory?.text?.map(section => (
                                        <div key={section.id}>
                                            <h4>{section.outline.name}</h4>
                                            {
                                                section.content?.map((content, index) => (
                                                    <div key={index}>
                                                        <p>{content.answer}</p>
                                                        {/* refs */}
                                                        <div className="mt-2 mb-4">
                                                            {
                                                                content?.videosArr?.map((ref, index) => (
                                                                    <p onClick={(e) => handleVideoLinkClick(e, ref)} className="mb-2 ml-2 break-words cursor-pointer text-primary-300 w-fit" key={index}>{ref?.source_path} | {ref?.timestamp}</p>
                                                                ))
                                                            }

                                                            {
                                                                content?.pdfsArr?.map((ref, index) => (
                                                                    <p onClick={(e) => handlePDFLinkClick(e, ref)} className="mb-2 ml-2 break-words cursor-pointer text-primary-300 w-fit" key={index}>{ref?.source_path} | {ref?.timestamp}</p>
                                                                ))
                                                            }
                                                            {
                                                                content?.imgsArr?.map((ref, index) => (
                                                                    <p onClick={(e) => handlePDFLinkClick(e, ref)} className="mb-2 ml-2 break-words cursor-pointer text-primary-300 w-fit" key={index}>{ref?.source_path} | {ref?.timestamp}</p>
                                                                ))
                                                            }

                                                        </div>
                                                        {/* ... */}
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                        }</>
                }
            </div>
        </div>
    );
}

export default InsightEditor;