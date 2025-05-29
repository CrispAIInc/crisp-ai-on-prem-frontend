import { useContext, useRef, useState } from 'react';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import LoadingSpinner from '../LoadingSpinner';
import makeApiRequest from '../../api';
import { MainContext } from '../../contexts/mainContext';


function StoriesEditor() {
    const { displayedSources } = useContext(MainContext);
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

    async function autoGenerateStory() {
        setIsLoading(true);
        const httpPayload = {
            storyContext: context,
            with_checked_sources: displayedSources?.filter(item => item?.is_selected)?.map(item => ({ source_path: item?.source_path, category: item?.category }))
        };
        try {
            const res = await makeApiRequest(
                "/auto-generate-story",
                "post",
                httpPayload
            );

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
                    className="w-full p-2 text-white bg-transparent border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    onFocus={() => setContextFocused(true)}
                    onBlur={() => setContextFocused(false)}
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                />
            </div>

            {/* generate outline button */}
            <button onClick={autoGenerateStory} className='relative flex items-center justify-center w-full max-w-full gap-2 py-2 m-auto text-center text-white rounded-md cursor-not-allowed disabled:opacity-50 bg-primary-300/85 hover:bg-primary-300'
                disabled={isLoading}>
                {isLoading ? <><LoadingSpinner isSmall /> Generating...</> : 'Generate outline'}
            </button>

            {/* editor */}

            <style>
                {`
                    .ql-toolbar.ql-snow + .ql-container.ql-snow {
                        display: none !important;
                    }
                `}
            </style>

            <div className='flex flex-col flex-1'>
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

                <div className='flex-1 !border !border-textColor-300 overflow-y-auto h-full'></div>
            </div>
        </div>
    );
}

export default StoriesEditor;