import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import RippleButton from '../RippleButton';
import useReferenceLinkClick from '../../hooks/useReferenceLinkClick';

import AddIcon from '@mui/icons-material/Add';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { MainContext } from '../../contexts/mainContext';
import makeApiRequest from '../../api';
import { useToast } from '../../contexts/toastContext';
import useResources from '../../hooks/useResources';
import LoadingSpinner from '../LoadingSpinner';
import ReactQuill, { Quill } from 'react-quill';
import ImageResize from "quill-image-resize-module-react";
import JoditEditor from 'jodit-react';

Quill.register("modules/imageResize", ImageResize);

// Custom module to handle reference link clicks
class ReferenceClickHandler {
    constructor(quill, options) {
        this.quill = quill;
        this.options = options;
        this.handleClick = this.handleClick.bind(this);

        // Add click event listener to the editor
        this.quill.root.addEventListener('click', this.handleClick);
    }

    handleClick(e) {
        const target = e.target;

        // Check if clicked element is a reference link
        if (target.classList.contains('reference-link')) {
            e.preventDefault();
            e.stopPropagation();

            const type = target.getAttribute('data-ref-type');
            const value = target.getAttribute('data-ref-value');

            // Call the callback function passed from options
            if (this.options.onReferenceClick && type && value) {
                this.options.onReferenceClick(type, value);
            }
        }
    }
}

// Extend the Block blot to allow custom attributes
const Block = Quill.import("blots/block");

class ReferenceLink extends Block {
    static create(value) {
        const node = super.create();
        if (value?.["data-ref-type"]) {
            node.setAttribute("data-ref-type", value["data-ref-type"]);
        }
        if (value?.["data-ref-value"]) {
            node.setAttribute("data-ref-value", value["data-ref-value"]);
        }
        if (value?.["class"]) {
            node.classList.add(value["class"]);
        }
        return node;
    }

    static formats(domNode) {
        return {
            "data-ref-type": domNode.getAttribute("data-ref-type"),
            "data-ref-value": domNode.getAttribute("data-ref-value"),
            class: domNode.getAttribute("class"),
        };
    }
}

ReferenceLink.blotName = "reference";
ReferenceLink.tagName = "li"; // or 'div', depending on your use
Quill.register(ReferenceLink, true);
Quill.register('modules/referenceClickHandler', ReferenceClickHandler);

function StoryEditor({
    storyTitle,
    setStoryTitle,
}) {

    const {
        theme,
        selectedStory,
        setSelectedStory,
        setStories
    } = useContext(MainContext);
    const { notify } = useToast();

    const { getStories } = useResources({ setStories });
    const { handlePDFLinkClick, handleVideoLinkClick } = useReferenceLinkClick(true);

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

    const generateStoryHTML = (generatedStory) => {
        if (!generatedStory) return "";

        // Case 1: raw HTML content
        if (
            generatedStory.text.length === 0 &&
            generatedStory.content !== ""
        ) {
            return generatedStory.content;
        }

        // Case 2: structured sections
        return generatedStory.text
            .map(section => `
      <h4>${section.outline.name}</h4>
      ${section.content
                    ?.map(content => `
          <p>${content.answer}</p>

          <div style="margin: 8px 0 16px 8px;">
            ${content.videosArr
                            ?.map(ref => `
                <li class="ref-link"
                   data-type="video"
                   data-source="${ref.source_path}"
                   data-timestamp="${ref.timestamp}">
                  ${ref.source_path} | ${ref.timestamp}
                </li>
              `)
                            .join("")}

            ${content.pdfsArr
                            ?.map(ref => `
                <li class="ref-link"
                   data-type="pdf"
                   data-source="${ref.source_path}"
                   data-page="${parseInt(ref.page) + 1}">
                  ${ref.source_path} | Page: ${parseInt(ref.page) + 1}
                </li>
              `)
                            .join("")}

            ${content.imgsArr
                            ?.map(ref => `
                <li class="ref-link"
                   data-type="image"
                   data-source="${ref.source_path}">
                  ${ref.source_path}
                </li>
              `)
                            .join("")}
          </div>
        `)
                    .join("")}
    `)
            .join("");
    };

    useEffect(() => {
        const handleClick = (e) => {
            const el = e.target.closest(".reference-link");
            if (!el) return;

            e.preventDefault();

            const payload = JSON.parse(
                decodeURIComponent(el.dataset.refPayload)
            );

            const info = {
                type: el.dataset.refType,
                sectionIndex: Number(el.dataset.sectionIndex),
                blockIndex: Number(el.dataset.blockIndex),
                refIndex: Number(el.dataset.refIndex),
                payload,
            };

            console.log("Reference clicked:", info);

            // Route based on type
            // if (info.type === "video") handleVideo(info.payload)
            // if (info.type === "pdf") handlePDF(info.payload)
            // if (info.type === "image") handleImage(info.payload)
        };

        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, []);


    function escapeHTML(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function formatReferenceLabel(ref, type) {
        if (type === "video") {
            return `${ref.source_path} | Timestamp: ${ref.timestamp}`;
        }

        if (type === "pdf") {
            return `${escapeHTML(ref.source_path)} | Page ${parseInt(ref.page, 10) + 1
                }`;
        }

        // image
        return escapeHTML(ref.source_path || "Image reference");
    }


    function renderReferences(
        refs = [],
        type,
        sectionIndex,
        blockIndex
    ) {
        if (!refs || refs.length === 0) return "";

        return `
            <h3 style="font-weight: 400; margin-top: 5px;">References: </h3>
            ${refs
                .map((ref, refIndex) => {
                    return `
        <li
          
          class="reference-link ql-reference"
          data-ref-type="${type}"
          data-section-index="${sectionIndex}"
          data-block-index="${blockIndex}"
          data-ref-index="${refIndex}"
          data-ref-payload='${encodeURIComponent(
                        JSON.stringify(ref)
                    )}'
          style="
            color: #2563eb;
            cursor: pointer;
            margin: 4px 0;
            word-break: break-word;
          "
        >
          ${formatReferenceLabel(ref, type)}
        </li>
      `;
                })
                .join("")
            }
        `;
    }


    function storyToHTML(sections = []) {
        return sections
            .map((section, sectionIndex) => {
                return `
        <h2
          style="
            font-weight: 700;
            font-size: 1.3rem;
            margin: 20px 0 10px;
          "
        >
          ${escapeHTML(section.outline?.name || "")}
        </h2>

        ${section.content
                        .map((block, blockIndex) => {
                            return `
              <p style="margin: 6px 0 10px;">
                ${escapeHTML(block.answer || "")}
              </p>

              <div style="margin-left: 20px; margin-bottom: 12px;">
                ${renderReferences(
                                block.videosArr,
                                "video",
                                sectionIndex,
                                blockIndex
                            )}
                ${renderReferences(
                                block.pdfsArr,
                                "pdf",
                                sectionIndex,
                                blockIndex
                            )}
                ${renderReferences(
                                block.imgsArr,
                                "image",
                                sectionIndex,
                                blockIndex
                            )}
              </div>
            `;
                        })
                        .join("")}
      `;
            })
            .join("");
    }



    const [isPending, setIsPending] = useState(false);
    const [value, setValue] = useState(generateStoryHTML(selectedStory) || "");
    const editorRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            const el = e.target.closest(".ref-link");
            if (!el) return;

            const type = el.dataset.type;

            if (type === "video") {
                handleVideoLinkClick(e, {
                    source_path: el.dataset.source,
                    timestamp: el.dataset.timestamp,
                });
            }

            if (type === "pdf") {
                handlePDFLinkClick(e, {
                    source_path: el.dataset.source,
                    page: el.dataset.page,
                });
            }

            if (type === "image") {
                handlePDFLinkClick(e, {
                    source_path: el.dataset.source,
                });
            }
        };

        document.addEventListener("click", handler);
        return () => document.removeEventListener("click", handler);
    }, []);

    useEffect(() => {
        if (!selectedStory?.text) return;
        setValue(storyToHTML(selectedStory?.text));
    }, [selectedStory?.text]);


    async function handleSaveStory() {
        try {
            setIsPending(true);
            await makeApiRequest('/stories', "POST", JSON.stringify({ ...selectedStory, story_name: storyTitle || selectedStory?.story_name }));
            notify({
                variant: "success",
                heading: "Story saved successfully!",
            });

            // update stories
            getStories();
        }
        catch (e) {
            console.log(e);
            notify({
                variant: "error",
                heading: "Oops!",
                subheading: 'Something bad happened. Please try again.',
            });
        } finally {
            setIsPending(false);
        }
    }

    function exportHTML() {
        var header =
            "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
            "xmlns:w='urn:schemas-microsoft-com:office:word' " +
            "xmlns='http://www.w3.org/TR/REC-html40'>" +
            `<head><meta charset='utf-8'><title>Story:${selectedStory.story_name}</title></head><body>`;
        var footer = "</body></html>";
        const htmlString = `
        <div>
            <h1 style='text-align: center; margin-bottom: 30px;'>${selectedStory.story_name
            }</h1>
        </div>
        
        <div>
            ${selectedStory?.content ? `<div>${selectedStory?.content}</div>` : selectedStory.text
                ?.map(
                    (item) => `
                <div>
                    ${item.outline.name
                            ? `
                        <div>
                            <div>
                                <div>
                                    ${item.sectionImages?.length > 0
                                ? `
                                        <div>
                                            ${item.sectionImages
                                    .map(
                                        (imgBlob) => `
                                                <img width="300" height="300" src="${imgBlob}" alt="img" />
                                            `
                                    )
                                    .join("")}
                                        </div>
                                    `
                                : ""
                            }
                                    <h3>${item.outline.name.replace(
                                /\n/g,
                                "<br>"
                            )}</h3>
                                </div>
                            </div>
                        </div>
                    `
                            : ""
                        }
                    <div>
                        <div>
                            ${item.content
                            ? `
                                <div>
                                    <div>
                                        ${typeof item.content === "string"
                                ? `
                                            ${item.contentImages?.length > 0
                                    ? `
                                                <div>
                                                    ${item.contentImages
                                        .map(
                                            (imgBlob) => `
                                                        <img width="300" height="300" src="${imgBlob}" alt="img" />
                                                    `
                                        )
                                        .join("")}
                                                </div>
                                            `
                                    : ""
                                }
                                            <h5>${item.content.replace(
                                    /\n/g,
                                    "<br>"
                                )}</h5>
                                        `
                                : `
                                            ${item.content?.map(
                                    (i) => `
                                                <div>
                                                    <div>
                                                        ${!i.answer.includes(
                                        "https://oaidalleapiprodscus.blob"
                                    )
                                            ? `
                                                            <p>${i.answer.replace(
                                                /\n/g,
                                                "<br>"
                                            )}</p>
                                                        `
                                            : `
                                                            <img width="300" height="300" src="${i.answer}" alt="image" />
                                                        `
                                        }
                                                    </div>
                                                    ${(i?.videosArr?.length > 0 ||
                                            i?.keyframesArr?.length > 0 ||
                                            i?.pdfsArr?.length > 0 ||
                                            i?.imgsArr?.length > 0)
                                            ? `
                                                        <div>
                                                            <p>References:</p>
                                                            ${i?.videosArr?.length >
                                                0
                                                ? `
                                                                <ul>
                                                                    ${i?.videosArr
                                                    ?.map(
                                                        (video) => `
                                                                        <li>${video.source_path +
                                                            " | Timestamp: " +
                                                            video.timestamp
                                                            }</li>
                                                                    `
                                                    )
                                                    .join("")}
                                                                </ul>
                                                            `
                                                : ""
                                            }
                                                            ${i?.keyframeArr
                                                ?.length > 0
                                                ? `
                                                                <ul>
                                                                    ${i?.keyframeArr
                                                    ?.map(
                                                        (video) => `
                                                                        <li>${video.source_path +
                                                            " | Keyframe: " +
                                                            video.timestamp
                                                            }</li>
                                                                    `
                                                    )
                                                    .join("")}
                                                                </ul>
                                                            `
                                                : ""
                                            }
                                                            ${i?.pdfsArr?.length > 0
                                                ? `
                                                                <ul>
                                                                    ${i?.pdfsArr
                                                    ?.map(
                                                        (pdf) => `
                                                                        <li>${pdf.source_path +
                                                            " | Page: " +
                                                            (parseInt(
                                                                pdf.page
                                                            ) +
                                                                1)
                                                            }</li>
                                                                    `
                                                    )
                                                    .join("")}
                                                                </ul>
                                                            `
                                                : ""
                                            }
                                                            ${i?.imgsArr?.length > 0
                                                ? `
                                                                <ul>
                                                                    ${i?.imgsArr?.map(
                                                    (img) => `
                                                                        <li>${img.source_path}</li>
                                                                    `
                                                )
                                                    .join("")}
                                                                </ul>
                                                            `
                                                : ""
                                            }
                                                        </div>
                                                    `
                                            : ""
                                        }
                                                </div>
                                            `
                                )
                                    .join("")}
                                        `
                            }
                                    </div>
                                </div>
                            `
                            : `<p></p>`
                        }
                        </div>
                    </div>
                </div>
            `
                )
                .join("")}
        </div>
        `;
        var sourceHTML = header + htmlString + footer;

        var source =
            "data:application/vnd.ms-word;charset=utf-8," +
            encodeURIComponent(sourceHTML);
        var fileDownload = document.createElement("a");
        document.body.appendChild(fileDownload);
        fileDownload.href = source;
        fileDownload.download = selectedStory.story_name + ".doc";
        fileDownload.click();
        document.body.removeChild(fileDownload);
    }

    const config = useMemo(() => ({
        readonly: false,
        cleanHTML: { fillEmptyParagraph: false },
        allowTags: 'section,div,p,br,hr,style',
        extraAllowedAttributes: ['class', 'style', 'data-index'],
        // Highlighting the "Source" button so you can see the tags being used
        buttons: 'source,bold,italic,underline,font,fontsize,brush,paragraph,ul,ol,hr'
    }), []);

    function renderRefs(refs) {
        if (refs.length === 0) return;

        // return HTML version of refs
        return `
            <div class="refs-block" contenteditable="false">
                <h6 style="margin-top: 5px;">References</h6>
                <ul style="display: flex; flex-direction: column; gap: 5px;">
                    ${refs.map(ref => {
            return `
                            <li data-source-object='${btoa(unescape(encodeURIComponent(JSON.stringify(ref))))}' class="ref-link" style="margin-bottom: 0px;">
                               🔗 ${ref.source_path} | ${ref.file_type === 'pdf' ? `Page: ${parseInt(ref.page) + 1}` : `timestamp: ${ref.timestamp}`}
                            </li>
                        `;
        }).join("")}
                </ul>
            </div>
        `;
    }

    const initialHTML = useMemo(() => {
        return selectedStory.text.map((item) => `
                <section class="item-group" data-id="${item.id}">
                    ${item.outline.nameHtml}
                    ${Array.isArray(item.content)
                ? item.content?.map(item => item.answerHtml)
                : item.content.answerHtml}
    
                    ${renderRefs([item.content[0].imgsArr, item.content[0].pdfsArr, item.content[0].videosArr].flat())}
                </section>
            `).join('<br />');
    }, [selectedStory.story_id, renderRefs]);

    const handleSave = (htmlContent) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const groups = doc.querySelectorAll('.item-group');

        const updatedTextArray = Array.from(groups).map((group, index) => {
            const oText = group.querySelector('.outline-block')?.textContent || "";
            const oHtml = group.querySelector('.outline-block')?.outerHTML || "";
            const aText = group.querySelector('.answer-block')?.textContent || "";
            const aHtml = group.querySelector('.answer-block')?.outerHTML || "";

            return {
                ...selectedStory.text[index],
                content: selectedStory.text[index].content.map(c => ({
                    ...c,
                    answer: aText,
                    answerHtml: aHtml
                })),
                outline: {
                    ...selectedStory.text[index].outline,
                    name: oText,
                    nameHtml: oHtml
                }
            };
        });

        setSelectedStory(prev => ({
            ...prev,
            text: updatedTextArray
        }));

        setStories(prev => {
            if (prev.length === 0) {
                return [{
                    ...selectedStory,
                    text: updatedTextArray,
                    story_name: storyTitle
                }];
            }
            return prev.map(item => {
                if (item.story_id === selectedStory.story_id) {
                    return selectedStory;
                }

                return item;
            });
        });
    };

    return (
        <div className='z-10 flex flex-col flex-1 h-full max-h-full overflow-y-hidden'>
            <div className="flex gap-2">
                <RippleButton
                    cssClasses="py-1 pl-2 !pr-3 mb-3 mt-4"
                    onClick={handleSaveStory}
                >
                    {isPending ? <LoadingSpinner isSmall /> : <AddIcon />}
                    <span className={` !text-[12px] font-medium`}>
                        Save story
                    </span>
                </RippleButton>
                <RippleButton
                    cssClasses="py-1 pl-2 !pr-3 mb-3 mt-4"
                    onClick={exportHTML}
                >
                    <FileDownloadOutlinedIcon />
                    <span className={` !text-[12px] font-medium`}>
                        Export story
                    </span>
                </RippleButton>
            </div>
            {/* story title */}
            <input
                className={`${theme === 'dark' && 'text-textColor-100'
                    } font-medium p-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-200/50 rounded-md" : '!border !border-textColor-100'} !outline-none w-full`}
                placeholder="New title..."
                value={storyTitle}
                onChange={(e) => setStoryTitle(e.target.value)}
            />
            <div className="h-full mt-2 flex flex-col overflow-y-hidden">
                {
                    theme === "light" ? (
                        <style>
                            {`
                                .ql-toolbar.ql-snow + .ql-container.ql-snow {
                                    display: none !important;
                                }
                                .custom-quill .ql-editor { 
                                    color: #333 !important;
                                }
                                .ql-toolbar {
                                    border-top-left-radius: 8px !important;
                                    border-top-right-radius: 8px !important;
                                    border-color: #ccc !important;
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
                                .ql-toolbar.ql-snow + .ql-container.ql-snow {
                                    display: none !important;
                                }
                                .custom-quill .ql-editor {
                                    color: #FFF !important;
                                }
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
                    value={value}
                    onChange={setValue}
                    readOnly={false}
                    className=""
                    modules={modules}
                    formats={formats}
                /> */}

                <div className="single-editor-container">
                    <JoditEditor
                        value={initialHTML}
                        config={config}
                        onBlur={handleSave}
                    />
                </div>

                {/* JSX render of the story (no editor) */}
                {/* {selectedStory !== null && <div className={`!z-10 flex-1 pl-2 !border ${theme === "dark" ? "!border !border-textColor-300" : '!border !border-textColor-100'} overflow-y-auto h-full ${theme === "light" ? "text-textColor-300" : "text-textColor-200"
                    }`}>
                    {
                        (selectedStory.text.length === 0 && selectedStory?.content !== "") ? (
                            <p dangerouslySetInnerHTML={{ __html: selectedStory?.content }}></p>
                        ) : selectedStory?.text?.map(section => (
                            <div key={section.id}>
                                <h4>{section.outline.name}</h4>
                                {
                                    section.content?.map((content, index) => (
                                        <div key={index}>
                                            <p>{content.answer}</p>
                                            <div className="mt-2 mb-4">
                                                {
                                                    content?.videosArr?.map((ref, index) => (
                                                        <p onClick={(e) => handleVideoLinkClick(e, ref)} className="mb-2 ml-2 break-words cursor-pointer text-primary-300 w-fit" key={index}>{ref?.source_path} | {ref?.timestamp}</p>
                                                    ))
                                                }

                                                {
                                                    content?.pdfsArr?.map((ref, index) => (
                                                        <p onClick={(e) => handlePDFLinkClick(e, ref)} className="mb-2 ml-2 break-words cursor-pointer text-primary-300 w-fit" key={index}>{ref.source_path + " | Page: " + (parseInt(ref?.page) + 1)}</p>
                                                    ))
                                                }
                                                {
                                                    content?.imgsArr?.map((ref, index) => (
                                                        <p onClick={(e) => handlePDFLinkClick(e, ref)} className="mb-2 ml-2 break-words cursor-pointer text-primary-300 w-fit" key={index}>{ref.source_path}</p>
                                                    ))
                                                }

                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        ))
                    }
                </div>} */}
            </div>
        </div>
    );
}

export default StoryEditor;