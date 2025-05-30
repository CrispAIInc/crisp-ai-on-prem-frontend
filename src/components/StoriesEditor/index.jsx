import { useContext, useRef, useState } from 'react';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import LoadingSpinner from '../LoadingSpinner';
import makeApiRequest from '../../api';
import { MainContext } from '../../contexts/mainContext';
import useReferenceLinkClick from '../../hooks/useReferenceLinkClick';


function StoriesEditor() {
    const { displayedSources, theme } = useContext(MainContext);
    const { handlePDFLinkClick, handleVideoLinkClick } = useReferenceLinkClick(true);

    const [contextFocused, setContextFocused] = useState(false);
    const [context, setContext] = useState('');
    const isActive = contextFocused || context.length > 0;

    const [isLoading, setIsLoading] = useState(false);

    const [value, setValue] = useState('');
    const editorRef = useRef(null);

    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, true] }],
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image', 'video'],
        ],
    };

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

    const [story, setStory] = useState({});

    async function autoGenerateStory() {
        setIsLoading(true);
        const httpPayload = {
            storyContext: context,
            with_checked_sources: displayedSources?.filter(item => item?.is_selected)?.map(item => ({ source_path: item?.source_path, category: item?.category }))
        };
        try {

            if (!displayedSources?.every(item => item?.is_selected === false)) {
                await makeApiRequest(
                    `/handle-embeddings`,
                    "post",
                    JSON.stringify({
                        sources: displayedSources?.filter(item => item?.is_selected)?.map(item => ({ source_path: item?.source_path, category: item?.category })),
                    })
                );
            }

            const res = await makeApiRequest(
                "/auto-generate-story",
                "post",
                httpPayload
            );

            setStory(res);
            console.log(res);



            // setSelectedStory((prev) => {
            //     prev.text.forEach((textItem, index) => {
            //         textItem.content = [
            //             {
            //                 answer: sections[index][0].answer,
            //                 refs: {
            //                     imageLinks: sections[index][0].imgsArr,
            //                     videoLinks: sections[index][0].videosArr,
            //                     keyframeLinks: sections[index][0].keyframesArr,
            //                     pdfLinks: sections[index][0].pdfsArr,
            //                 }
            //             }
            //         ];
            //     });

            //     return prev;
            // });
        } catch (error) {
            console.log(error);
        } finally {
            // setIsGeneratingIntroConlusion(false);
            // console.log(selectedStory.text);
            setIsLoading(false);
        }
    }

    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left - 60,
            y: e.clientY - rect.top + 10,
        });
    };

    const handleMouseEnter = () => context === "" && setTooltipVisible(true);
    const handleMouseLeave = () => setTooltipVisible(false);

    return (
        <div className="relative z-10 flex flex-col h-full gap-1">
            {/* context */}
            <div className="relative w-full mt-6">
                <label
                    className={`absolute left-2 top-2 text-gray-500  px-1 transition-all duration-200 pointer-events-none
                    ${isActive ? 'text-md -top-8 left-1 text-blue-600' : 'text-base top-2.5'}`}
                >
                    Write your story outline
                </label>
                <textarea
                    className={`w-full p-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-300 text-textColor-200" : '!border !border-textColor-100 text-textColor-300'} rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    rows="2"
                    onFocus={() => setContextFocused(true)}
                    onBlur={() => setContextFocused(false)}
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                />
            </div>

            {/* generate outline button */}
            {/* <button onClick={autoGenerateStory} className='relative flex items-center justify-center w-full max-w-full gap-2 py-2 m-auto text-center text-white rounded-md cursor-not-allowed disabled:opacity-50 bg-primary-300/85 hover:bg-primary-300'
                disabled={isLoading}>
                {isLoading ? <><LoadingSpinner isSmall /> Generating...</> : 'Generate outline'}
            </button> */}
            {/* generate button */}
            <div className='relative inline-block' onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}>
                <button className='relative flex items-center justify-center w-full max-w-full gap-2 py-2 m-auto text-center text-white rounded-md cursor-not-allowed disabled:opacity-50 bg-primary-300/85 hover:bg-primary-300'
                    disabled={context === "" || isLoading} onClick={autoGenerateStory}>
                    {isLoading ? <><LoadingSpinner isSmall /> Generating...</> : 'Generate'}
                </button>
                {tooltipVisible && (
                    <p
                        // onMouseEnter={() => setTooltipVisible(false)}
                        className={`absolute p-2 text-sm font-semibold rounded shadow-2xl bg-background_workspace top-full ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'} z-20`}
                        style={{ top: position.y, left: position.x, opacity: tooltipVisible ? 1 : 0 }}
                    >
                        Please provide the context
                    </p>
                )}
            </div>

            {/* editor */}

            <style>
                {`
                    .ql-toolbar.ql-snow + .ql-container.ql-snow {
                        display: none !important;
                    }
                `}
            </style>

            {
                theme === "light" ? (
                    <style>
                        {`
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
            <div className='flex flex-col flex-1 h-full max-h-full overflow-y-hidden'>
                <ReactQuill
                    ref={editorRef}
                    theme="snow"
                    value={value}
                    onChange={setValue}
                    readOnly={true}
                    className=""
                    modules={modules}
                    formats={formats}
                />

                <div className={`flex-1 pl-2 !border ${theme === "dark" ? "!border !border-textColor-300" : '!border !border-textColor-100'} overflow-y-auto h-full ${theme === "light" ? "text-textColor-300" : "text-textColor-200"
                    }`}>
                    <h1>{story.story_name}</h1>
                    {
                        story?.text?.map(section => (
                            <div key={section.id}>
                                <h2>{section.outline.name}</h2>
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
                                                    content?.pdfsArray?.map((ref, index) => (
                                                        <p onClick={(e) => handlePDFLinkClick(e, ref)} className="mb-2 ml-2 break-words cursor-pointer text-primary-300 w-fit" key={index}>{ref?.source_path} | {ref?.timestamp}</p>
                                                    ))
                                                }
                                                {
                                                    content?.imgsArray?.map((ref, index) => (
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
        </div>
    );
}

export default StoriesEditor;
