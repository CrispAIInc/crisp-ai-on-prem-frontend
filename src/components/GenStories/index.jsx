import { useContext, useState, useRef, useEffect } from "react";
import { escape, blacklist } from 'validator';


import AddCircleIcon from '@mui/icons-material/AddCircle';
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import SendIcon from "@mui/icons-material/Send";
import Button from '@mui/material/Button';

import CustomButton from "../CustomButton";
import GenStoriesLLMModal from "../GenStoriesLLMModal";
import CustomInput from "../CustomInput";

import { MainContext } from "../../contexts/mainContext";
import { extractSections, extractTitle, generateRandomHash, getLevelOfSectionInGenStories } from '../../utils';
import makeApiRequest from "../../api";

const GenStories = () => {
    const [showLLMModal, setShowLLMModal] = useState(false);
    const [input, setInput] = useState("");
    const [outlinesAnswers, setOutlinesAnswers] = useState([]);
    const [showCursor, setShowCursor] = useState(false);
    const [currentOutlineCursorId, setCurrentOutlineCursorId] = useState("");

    const chatAppRef = useRef();

    const {
        theme,
        selectedGenStoriesModels,
        setSelectedGenStoriesModels,
        llmModels,
        setSelectedStory,
        setActiveView,
    } = useContext(MainContext);

    useEffect(() => {
        chatAppRef.current.scrollTop = chatAppRef.current?.scrollHeight;
    }, [outlinesAnswers, outlinesAnswers.length]);

    const onHideLLMModal = () => {
        setShowLLMModal(false);
    };

    useEffect(() => {
        setCurrentOutlineCursorId(outlinesAnswers.at(-1)?.id);
    }, [outlinesAnswers]);

    const sendQuery = async (query, _models = []) => {
        try {
            if (!query && !input) return;
            setShowCursor(true);
            let selectedModels = _models.length > 0 ? _models : selectedGenStoriesModels;
            // let validatedInput;
            // if (query) {
            //     validatedInput = blacklist(query);
            // } else {
            //     validatedInput = blacklist(input, '<>/');
            // }
            setOutlinesAnswers((prev) => [
                ...prev,
                { query: input || query, models: selectedModels },
                { id: generateRandomHash(10), answer: '', models: selectedModels },
            ]);
            setInput("");
            const { answer } = await makeApiRequest(
                `/llm-chat/${selectedModels}`,
                "post",
                { query }
            );

            // make answer to be well formatted with correct HTML headings and paragraphs
            const sections = extractSections(answer);
            const htmlContent = sections.map((section, index) => {
                const headingLevel = getLevelOfSectionInGenStories(section, true);
                return `<h${headingLevel} key="${index}" style='font-style: italic; font-weight: 700;'>${section}</h${headingLevel}>`;
            });


            setOutlinesAnswers((prev) => {
                const updatedOutlines = [...prev];
                updatedOutlines[prev.length - 1].answer = answer;
                updatedOutlines[prev.length - 1].htmlContent = htmlContent.join('');
                return updatedOutlines;
            });
        } catch (error) {
            console.log(error);
        } finally {
            setShowCursor(false);
        }
    };

    function addOutlineToStory(outline, models = selectedGenStoriesModels) {
        const sections = extractSections(outline);
        const text = sections.map((section) => {
            return {
                outline: {
                    id: generateRandomHash(10),
                    name: section
                },
                content: '',
            };
        });
        const newStory = {
            story_id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 9),
            story_name: extractTitle(outline),
            text,
            models,
        };
        displayStory(newStory);
    }

    function displayStory(story) {
        setSelectedStory(story);
        setActiveView('story');
    }

    return (
        <div className="relative flex flex-col flex-1 h-full overflow-y-auto">
            {/* models button */}
            <div className="flex flex-wrap items-center justify-center gap-3">
                <CustomButton
                    className={`my-0 ${theme === "light"
                        ? "bg-white !text-dark border border-textColor-100"
                        : " !text-textColor-100 !border !border-textColor-300"
                        }`}
                    onClick={() => setShowLLMModal(true)}
                    style={{ width: "100%" }}
                >
                    Models
                </CustomButton>
                <GenStoriesLLMModal
                    show={showLLMModal}
                    onHide={onHideLLMModal}
                    selectedGenStoriesModels={selectedGenStoriesModels}
                    setSelectedGenStoriesModels={setSelectedGenStoriesModels}
                    llmModels={llmModels}
                    className="modal"
                />
            </div>

            {/* selected models */}
            <div className="flex items-center gap-1 mx-2 my-3">
                <span
                    className={`text-xs ${theme === "light" ? "text-textColor-300" : "text-textColor-200"
                        }`}
                >
                    Selected models:{" "}
                </span>
                <div
                    className={`flex items-center divide-x  ${theme === "light" ? "divide-textColor-100" : "divide-textColor-300"
                        }`}
                >
                    {selectedGenStoriesModels.length === 0 ? (
                        <span
                            className={`text-xs ${theme === "light" ? "text-textColor-300" : "text-textColor-200"
                                }`}
                        >
                            none
                        </span>
                    ) : (
                        selectedGenStoriesModels.map((model, index) => (
                            <span
                                key={index}
                                className={`text-xs ${theme === "light"
                                    ? "text-textColor-300"
                                    : "text-textColor-200"
                                    }`}
                            >
                                {model.toUpperCase()}{" "}
                            </span>
                        ))
                    )}
                </div>
            </div>

            {/* chat container */}
            <div
                className={`flex flex-col flex-1 flex-grow h-full gap-3 py-3 overflow-y-auto ${theme === "light" ? "!border" : "!border !border-textColor-300"
                    }`}
                ref={chatAppRef}
            >
                {/* list all outline answers here as a chat */}
                {outlinesAnswers.length > 0 ? (
                    outlinesAnswers.map((outline, index) =>
                        outline.query ? (
                            <>
                                <div key={index} className="my-2 break-all w-fit">
                                    <div
                                        className={`message user-message h-full flex flex-col m-2 p-2  bg-primary-300 text-white rounded-md`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <b className="">You: </b>
                                            <div
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    sendQuery(outline.query, outline.models);
                                                }}
                                            >
                                                <ReplayOutlinedIcon />
                                            </div>
                                        </div>
                                        {<p className="m-0">{outline.query}</p>}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div key={index}>
                                    <div className={`message bot-message h-full`}>
                                        <div
                                            className={`flex flex-col h-full p-2 m-2 rounded-md break-words ${theme === "light"
                                                ? "bg-separator text-textColor-200"
                                                : "bg-background_workspace"
                                                }`}
                                        >
                                            <>
                                                <b
                                                    className={`${theme === "light"
                                                        ? "text-textColor-300"
                                                        : "text-textColor-100"
                                                        }`}
                                                >
                                                    Chatbot:{" "}
                                                </b>
                                                <div
                                                    className={`${theme === "light"
                                                        ? "text-textColor-300"
                                                        : "text-textColor-100"
                                                        }`}
                                                >
                                                    {/* {outline.answer} */}
                                                    <div dangerouslySetInnerHTML={{ __html: outline.htmlContent }}></div>
                                                </div>
                                                {showCursor && outline.id === currentOutlineCursorId ? (
                                                    <div className="inline-block w-1 h-5 bg-textColor-300 animate-blink"></div>
                                                ) : null}

                                                {/* add to report => show in editor */}
                                                <Button onClick={() => addOutlineToStory(outline.answer, outline.models)}><AddCircleIcon /></Button>

                                                <div className="flex flex-wrap items-center gap-1">
                                                    <span
                                                        className={`text-xs ${theme === "light"
                                                            ? "text-textColor-300"
                                                            : "text-textColor-200"
                                                            }`}
                                                    >
                                                        Models:{" "}
                                                    </span>
                                                    {outline.models.map((item, index) => (
                                                        <span
                                                            key={index}
                                                            className={`text-xs divide-x ${theme === "light"
                                                                ? "text-textColor-300"
                                                                : "text-textColor-200"
                                                                }`}
                                                        >
                                                            {item.toUpperCase()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )
                    )
                ) : (
                    null
                )}
            </div>

            {/* message input container */}
            <div className="flex items-center gap-2 input-area">
                <CustomInput
                    placeholder="Message model..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            sendQuery(input);
                        }
                    }}
                />
                <div
                    className={`p-2 rounded-md cursor-pointer ${theme === "light" ? "border" : "!border !border-textColor-300"
                        }`}
                    onClick={() => sendQuery(input)}
                >
                    <SendIcon color="primary" />
                </div>
            </div>
        </div>
    );
};

export default GenStories;
