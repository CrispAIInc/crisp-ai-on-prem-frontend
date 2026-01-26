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



function StoryEditor({
    generatedStory,
    storyTitle,
    setStoryTitle,
}) {

    const {
        theme,
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
            return `${escapeHTML(ref.file_type || "video")} | ${escapeHTML(
                ref.metadata?.chapters?.title || "Video reference"
            )}`;
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

        return refs
            .map((ref, refIndex) => {
                return `
        <p
          class="reference-link"
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
        </p>
      `;
            })
            .join("");
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
    const [value, setValue] = useState(generateStoryHTML(generatedStory) || "");
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
        if (!generatedStory?.text) return;
        setValue(storyToHTML(generatedStory?.text));
    }, [generatedStory?.text]);


    async function handleSaveStory() {
        try {
            setIsPending(true);
            await makeApiRequest('/stories', "POST", JSON.stringify({ ...generatedStory, story_name: storyTitle || generatedStory?.story_name }));
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
            `<head><meta charset='utf-8'><title>Story:${generatedStory.story_name}</title></head><body>`;
        var footer = "</body></html>";
        const htmlString = `
        <div>
            <h1 style='text-align: center; margin-bottom: 30px;'>${generatedStory.story_name
            }</h1>
        </div>
        
        <div>
            ${generatedStory?.content ? `<div>${generatedStory?.content}</div>` : generatedStory.text
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
        fileDownload.download = generatedStory.story_name + ".doc";
        fileDownload.click();
        document.body.removeChild(fileDownload);
    }


    return (
        <div className='flex flex-col flex-1 h-full max-h-full overflow-y-hidden'>
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
            <div className="h-full overflow-y-auto mt-2">
                {
                    theme === "light" ? (
                        <style>
                            {`
                                .ql-container {
                                    border: 1px solid #ccc !important;
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
                <ReactQuill
                    ref={editorRef}
                    theme="snow"
                    value={value}
                    onChange={setValue}
                    readOnly={false}
                    className=""
                    modules={modules}
                    formats={formats}
                />
            </div>
        </div>
    );
}

export default StoryEditor;