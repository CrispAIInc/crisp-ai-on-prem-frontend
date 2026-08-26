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
import { ProjectContext } from '../../contexts/projectContext';

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

    const { isProjectReadOnly } = useContext(ProjectContext);

    const {
        theme,
        selectedStory,
        setSelectedStory,
        setStories,
        contentPanelContainerRef
    } = useContext(MainContext);
    const { notify } = useToast();

    const { getStories } = useResources({ setStories });
    const { handleSourceLinkClick } = useReferenceLinkClick(true, contentPanelContainerRef);

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

    const [isPending, setIsPending] = useState(false);


    async function handleSaveStory() {
        try {
            setIsPending(true);
            await makeApiRequest('/stories/save', "POST", JSON.stringify({ ...selectedStory, story_name: storyTitle || selectedStory?.story_name }));
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
        readonly: isProjectReadOnly,
        cleanHTML: { fillEmptyParagraph: false },
        allowTags: 'section,div,p,br,hr,style',
        extraAllowedAttributes: ['class', 'style', 'data-index'],
        // Highlighting the "Source" button so you can see the tags being used
        buttons: 'source,bold,italic,underline,font,fontsize,brush,paragraph,ul,ol,hr'
    }), []);

    function renderRefs(refs) {
        return `
            <div class="refs-block" contenteditable="false">
                <h6 style="margin-top: 5px;">References</h6>
                <ul style="display: flex; flex-direction: column; gap: 5px;">
                    ${refs.map(ref => {
            return `
                            <li data-source-object='${btoa(unescape(encodeURIComponent(JSON.stringify(ref))))}' class="ref-link" style="margin-bottom: 0px;">
                               🔗 ${ref.source_path} | ${ref.file_type === 'pdf' ? `Page: ${parseInt(ref.page) + 1}` : ref.file_type === 'video' ? `timestamp: ${ref.timestamp}` : ''}
                            </li>
                        `;
        }).join("")}
                </ul>
            </div>
        `;
    }

    const initialHTML = useMemo(() => {
        return selectedStory.text.map((item) => {
            const flatRefs = [item.content[0].imgsArr, item.content[0].pdfsArr, item.content[0].videosArr].flat();

            return `
                <section class="item-group" data-id="${item.id}">
                    ${item.outline.nameHtml}
                    ${Array.isArray(item.content)
                    ? item.content?.map(item => item.answerHtml)
                    : item.content.answerHtml}
    
                    ${flatRefs.length > 0 ? renderRefs(flatRefs) : ''}
                </section>
            `;
        }).join('<br />');
    }, [selectedStory.story_id, renderRefs]);

    const handleSave = (htmlContent) => {
        if (isProjectReadOnly) return;
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
            {!isProjectReadOnly && <div className="flex gap-2">
                <RippleButton
                    cssClasses="py-1 pl-2 !pr-3 mb-3 mt-4"
                    onClick={handleSaveStory}
                >
                    {isPending ? <LoadingSpinner isSmall /> : <AddIcon />}
                    <span className={`${isPending && 'ml-2'}  !text-[12px] font-medium`}>
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
            </div>}
            {/* story title */}
            <input
                className={`${theme === 'dark' && 'text-textColor-100'
                    } font-medium p-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-200/50 rounded-md" : '!border !border-textColor-100'} !outline-none w-full`}
                placeholder="New title..."
                disabled={isProjectReadOnly}
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

                <div className="single-editor-container">
                    <JoditEditor
                        value={initialHTML}
                        config={config}
                        onBlur={handleSave}
                    />
                </div>
            </div>
        </div>
    );
}

export default StoryEditor;