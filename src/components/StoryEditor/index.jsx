import React, { useContext, useState } from 'react';
import RippleButton from '../RippleButton';
import useReferenceLinkClick from '../../hooks/useReferenceLinkClick';

import AddIcon from '@mui/icons-material/Add';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { MainContext } from '../../contexts/mainContext';
import makeApiRequest from '../../api';
import { useToast } from '../../contexts/toastContext';
import useResources from '../../hooks/useResources';
import LoadingSpinner from '../LoadingSpinner';

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


    const [isPending, setIsPending] = useState(false);

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

            {generatedStory !== null && <div className={`z-10 flex-1 pl-2 !border ${theme === "dark" ? "!border !border-textColor-300" : '!border !border-textColor-100'} overflow-y-auto h-full ${theme === "light" ? "text-textColor-300" : "text-textColor-200"
                }`}>
                {
                    (generatedStory.text.length === 0 && generatedStory?.content !== "") ? (
                        <p dangerouslySetInnerHTML={{ __html: generatedStory?.content }}></p>
                    ) : generatedStory?.text?.map(section => (
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
            </div>}
        </div>
    );
}

export default StoryEditor;