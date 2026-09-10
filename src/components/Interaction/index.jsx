import { useContext, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import { EventSourcePolyfill } from 'event-source-polyfill';
import makeApiRequest from "../../api";
import { MainContext } from "../../contexts/mainContext";
import { decimalSecondsToHHMMSS, timeToSeconds } from '../../utils';
import CustomSelectTwo from '../CustomSelectTwo';

import { ProjectContext } from '../../contexts/projectContext.jsx';
import useAuth from '../../hooks/useAuth.js';
import useChat from '../../hooks/useChat.js';
import useReferenceLinkClick from "../../hooks/useReferenceLinkClick.js";
import { useResizableSidebar } from '../../hooks/useResizableSidebar.js';
import AnimatedText from '../AnimatedText/index.jsx';
import ChatInput from '../ChatInput/index.jsx';
import Chip from '../Chip/index.jsx';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

const ChatMessage = ({ text, refs, timestamps }) => {
    const {
        contentPanelContainerRef
    } = useContext(MainContext);
    const { handleSourceLinkClick } = useReferenceLinkClick(true, contentPanelContainerRef);

    return (
        <div>
            {timestamps && timestamps.length > 0 && (
                <div className="text-xs font-medium text-neutral-500 mb-1">
                    {timestamps[0]} → {timestamps[1]}
                </div>
            )}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {text}
            </ReactMarkdown>
            <div>
                {(refs?.videoLinks?.length > 0 ||
                    refs?.keyframeLinks?.length > 0 ||
                    refs?.pdfLinks?.length > 0 ||
                    refs?.imageLinks?.length > 0) && (
                        <p className="mt-2 font-medium  text-gradient-x">References:</p>
                    )}

                {/* Video links */}
                {refs?.videoLinks?.length > 0 && (
                    <ul className="flex flex-col gap-1 pl-1 text-sm break-all whitespace-normal">
                        {refs.videoLinks.map((video, index) => {
                            return (
                                <Chip
                                    key={video.source_path + '' + index}
                                    content={`${video.source_path} | Timestamp: ${video.timestamp}`}
                                    data-object={video}
                                    handleClick={(e) => handleSourceLinkClick(e, video)}
                                    cssClasses={`ml-0 cursor-pointer break-keep ${!video.score && 'text-gradient-x'}`}
                                />
                            );
                        })}
                    </ul>
                )}

                {/* Keyframe links */}
                {refs?.keyframeLinks?.length > 0 && (
                    <ul className="flex flex-col gap-1 pl-1 text-sm break-all whitespace-normal">
                        {refs.keyframeLinks.map((video, index) => (
                            <Chip
                                key={video.source_path + '' + index}
                                content={`${video.source_path} | Keyframe at: ${decimalSecondsToHHMMSS(video.timestamp)}`}
                                data-object={video}
                                handleClick={(e) => handleSourceLinkClick(e, video)}
                                cssClasses="ml-0 cursor-pointer  break-keep text-gradient-x"
                            />
                        ))}
                    </ul>
                )}

                {/* PDF links */}
                {refs?.pdfLinks?.length > 0 && (
                    <ul className="flex flex-col gap-1 pl-1 text-sm break-all whitespace-normal">
                        {refs.pdfLinks.map((pdf, index) => (
                            <Chip
                                key={pdf.source_path + '' + index}
                                content={`${pdf.source_path} | Page: ${parseInt(pdf.page, 10)}`}
                                data-object={pdf}
                                handleClick={(e) => { handleSourceLinkClick(e, pdf); }}
                                cssClasses="ml-0 cursor-pointer  break-keep text-gradient-x"
                            />
                        ))}
                    </ul>
                )}

                {/* Image links */}
                {refs?.imageLinks?.length > 0 && (
                    <ul className="flex flex-col gap-1 pl-1 text-sm break-all whitespace-normal">
                        {refs.imageLinks.map((img, index) => (
                            <Chip
                                key={img.source_path + '' + index}
                                content={img.source_path}
                                data-object={img}
                                handleClick={(e) => handleSourceLinkClick(e, img)}
                                cssClasses="ml-0 cursor-pointer  break-keep text-gradient-x"
                            />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

const Interaction = () => {
    const {
        knowledgeBase,
        theme,
        currentResource,
        fromChat, setFromChat,
        isFoundationLlm,
        resourceURL,
        noteReferences,
        player,
        isPlayerReady,
        setCurrentChat,
        displayedSources,
        selectedLanguage, setSelectedLanguage,
        languageOptions,
        currentChat,
        chatHistory,
        setChatHistory,
        metadataPanelContainer
    } = useContext(MainContext);

    const { currentProject, isProjectReadOnly } = useContext(ProjectContext);

    const { token } = useAuth();

    const { addNewChat } = useChat();

    const { maxWidth, sidebarWidth } = useResizableSidebar(200, false);

    const { handleSourceLinkClick } = useReferenceLinkClick(true, metadataPanelContainer);

    const chatAppRef = useRef();

    const [messages, setMessages] = useState(currentChat?.messages || []);
    const [responseIndex, setResponseIndex] = useState(currentChat?.messages?.length - 1 || -1);
    useEffect(() => {
        setMessages(currentChat?.messages || []);
        setResponseIndex(currentChat?.messages?.length - 1 || -1);
    }, [currentChat]);
    const [input, setInput] = useState("");
    const [sourceIds, setSourceIds] = useState([]);

    // const [selectedLanguage, setSelectedLanguage] = useState("en"); // chat default language

    const [originalQueries, setOriginalQueries] = useState([]);
    const [originalResponses, setOriginalResponses] = useState([]);

    const crispWizInputRef = useRef(null);
    const crispWizInputContainerRef = useRef(null);

    const [showCursor, setShowCursor] = useState(false);

    useEffect(() => {
        if (messages?.length > 0 && chatAppRef.current) {
            const chatContainer = chatAppRef.current;
            requestAnimationFrame(() => {
                chatContainer.scrollTo({
                    top: chatContainer.scrollHeight,
                    behavior: "auto",
                });
            });
        }
    }, [messages]);

    useEffect(() => {
        if (
            fromChat &&
            isPlayerReady &&
            resourceURL &&
            currentResource?.file_type === "video"
        ) {
            const timestamp = currentResource?.timestamp; // Make sure you have the timestamp here
            if (timestamp !== undefined && timestamp !== null) {
                player?.current?.seekTo(typeof timestamp === "number" ? timestamp : timeToSeconds(timestamp));
            }
            setFromChat(false);
        }
    }, [isPlayerReady, currentResource, currentResource?.timestamp]);

    const [isFetchingRefs, setIsFetchingRefs] = useState(false);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            if (!e.shiftKey) {
                e.preventDefault(); // stop newline
                sendMessage(input);
            }
            // Shift + Enter → allow default behavior (newline)
        }
    };

    const sendMessage = async (message, isRepeated = false) => {
        console.log(message);

        if (message.trim() === "" && input.trim() === "" && !isRepeated) return;

        if (message.trim() === "" && isRepeated) return;

        if (showCursor === true || isFetchingRefs === true) return;

        setShowCursor(true);

        let userMessage = "";

        if (selectedLanguage != "en") {
            const data = await makeApiRequest(
                `/translate`,
                "post",
                JSON.stringify({ text: input || message, language: selectedLanguage })
            );
            userMessage = data.translatedText;
        } else userMessage = input || message;

        userMessage = userMessage?.trim();

        setInput("");

        setOriginalQueries([...originalQueries, userMessage]);
        setMessages([
            ...messages,
            { sender: "user", text: userMessage, question: userMessage },
            { sender: "bot", text: "", question: userMessage, botText: "", refs: {} },
        ]);
        setResponseIndex((responseIndex) => responseIndex + 2);

        let botMessage = "";

        try {
            // add or remove embeddings from Vector store
            if (sourceIds.length > 0) {

                const sourcesUsed = knowledgeBase
                    .filter(({ source_id }) => sourceIds.includes(source_id))
                    .map(({ source_id, index_id }) => ({
                        source_id,
                        index_id
                    }));

                await makeApiRequest(
                    `/handle-embeddings`,
                    "post",
                    JSON.stringify({
                        sources: sourcesUsed,
                    })
                );
            }

            let sessionID = null; // Variable to store the session ID
            const eventSource = new EventSourcePolyfill(`${API_ENDPOINT}/message/${encodeURIComponent(userMessage?.replace(/\n/g, ' '))}/${sourceIds.length > 0 ? false : true}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    SessionId: currentChat?.sessionId,
                    ProjectId: currentProject?.project_id,
                },
                heartbeatTimeout: 75000,
            });

            eventSource.onmessage = async function (event) {
                const data = JSON.parse(event.data);

                if (data.type === "SESSION_ID") {
                    sessionID = data.session_id;
                } else if (data.text === "") {
                    setIsFetchingRefs(true);
                } else if (data.type === "MESSAGE") {
                    setShowCursor(false);
                    const newToken = data.text;
                    botMessage += newToken;
                    setMessages((prevMessages) => {
                        const newMessages = [...prevMessages];
                        if (newMessages.length > 0) {
                            const lastMessageIndex = newMessages.length - 1;
                            newMessages[lastMessageIndex] = {
                                ...newMessages[lastMessageIndex],
                                text: botMessage,
                                botText: botMessage,
                            };
                        }
                        return newMessages;
                    });
                } else if (data.type === "REFERENCES") {
                    // extract the last part of the streaming and call fetchReferences
                    // await delay(Math.floor(Math.random() * (4000 - 2500 + 1)) + 2500); // artificial delay to ensure botMessage is updated
                    fetchReferences(userMessage, botMessage, data.data);
                    setIsFetchingRefs(false);
                }
            };

            eventSource.onerror = async function () {
                setShowCursor(false);
                eventSource.close();

                if (eventSource.readyState === EventSource.CLOSED) {
                    setOriginalResponses([...originalResponses, botMessage]);
                } else {
                    console.error("Connection was closed due to an error.");
                }
            };
        } catch (error) {
            console.log(error);
            setMessages(prev => prev.slice(0, -2));
            // setShowCursor(false);
            // setIsFetchingRefs(false);
        } finally {
            // setShowCursor(false);
            // setIsFetchingRefs(false);
        }
    };


    // allRefs means that we work with Contextual Interaction crisp wiz normal refs
    const fetchReferences = async (userMessage, botMessage, data, timestamps = [], allRefs = true) => {
        // const response = await axios.get(`${API_ENDPOINT}/references`);
        // const data = response.data;
        noteReferences.videoLinks = [];
        noteReferences.pdfLinks = [];
        noteReferences.imageLinks = [];
        noteReferences.keyframeLinks = [];

        let refs = {
            videoLinks: [],
            keyframeLinks: [],
            pdfLinks: [],
            imageLinks: [],
        };
        const chatIndex = chatHistory.findIndex(chat => chat.sessionId === currentChat?.sessionId);
        if (chatIndex === -1) {
            addNewChat("New Chat " + (chatHistory.length + 1), [{ sender: "user", text: userMessage, question: userMessage }, { sender: "bot", text: botMessage, botText: botMessage, question: userMessage, refs, timestamps }]);
        } else {
            setChatHistory(prev => {
                const chatToUpdate = prev[chatIndex];
                chatToUpdate.messages = [...chatToUpdate.messages, { sender: "user", text: userMessage, question: userMessage }, { sender: "bot", text: botMessage, botText: botMessage, question: userMessage, refs, timestamps }];
                const { isTemp, ...rest } = chatToUpdate;
                prev[chatIndex] = rest;
                return prev;
            });
            setCurrentChat(chatHistory[chatIndex]);
        }

        let videoLinks = [];
        let keyframeLinks = [];
        let pdfLinks = [];
        let imageLinks = [];

        if (allRefs) {
            videoLinks = data.video_references.map((video) => {
                noteReferences.videoLinks.push(video.source_path + " | Timestamp: " + video.timestamp);
                refs["videoLinks"].push(video);
                return (
                    <Chip key={video.source_path} content={video.source_path + " | Timestamp: " + video.timestamp} data-object={video} handleClick={(event) => handleSourceLinkClick(event, video)} cssClasses="ml-0 cursor-pointer  text-gradient-x" />
                );
            });

            keyframeLinks = data.keyframe_references.map((video) => {
                noteReferences.keyframeLinks.push(video.source_path + " | Keyframe at: " + decimalSecondsToHHMMSS(video.timestamp));
                refs["keyframeLinks"].push(video);
                return (
                    <Chip key={video.source_path} content={video.source_path + " | keyframe at: " + decimalSecondsToHHMMSS(video.timestamp)} data-object={video} handleClick={(event) => handleSourceLinkClick(event, video)} cssClasses="ml-0 cursor-pointer  text-gradient-x" />
                );
            });

            pdfLinks = data?.pdf_references?.map((pdf) => {
                noteReferences.pdfLinks.push(pdf.source_path + " | Page: " + (parseInt(pdf.page)));
                refs["pdfLinks"].push(pdf);
                return (
                    <Chip key={pdf.source_path} content={pdf.source_path + " | Page: " + (parseInt(pdf.page))} data-object={pdf} handleClick={(event) => handleSourceLinkClick(event, pdf)} cssClasses="ml-0 cursor-pointer  text-gradient-x" />
                );
            });

            imageLinks = data?.img_references?.map((img) => {
                noteReferences.imageLinks.push(img.source_path);
                refs["imageLinks"].push(img);
                return (
                    <Chip key={img.source_path} content={img.source_path} data-object={img} handleClick={(event) => handleSourceLinkClick(event, img)} cssClasses="ml-0 cursor-pointer" />
                );
            });
        } else {
            videoLinks = data.map((video) => {
                const timestamps = `${video.source_path} | Timestamp: ${video.timestamp} | ${Number.isInteger(video.score * 100) ? video.score * 100 : (video.score * 100).toFixed(2)}%`;

                noteReferences.videoLinks.push(timestamps);
                refs["videoLinks"].push(video);
                return (
                    <Chip key={video.source_path} content={timestamps} data-object={video} handleClick={(event) => handleSourceLinkClick(event, video)} cssClasses="ml-0 cursor-pointer" />
                );
            });
        }

        let newData = null;

        // Append the references to the botMessage
        if (selectedLanguage != "en") {
            newData = await makeApiRequest(
                "/translate",
                "post",
                JSON.stringify({ text: data.bot_message, language: selectedLanguage })
            );
        }

        botMessage = (
            <div>
                {timestamps.length > 0 && (
                    <p className="text-xs text-gray-500 mb-1">{timestamps[0]} - {timestamps[1]}</p>
                )}
                <div className="coorg-response">
                    {selectedLanguage == "en" ? data.bot_message : newData.translatedText}
                </div>

                {!isFoundationLlm && videoLinks && keyframeLinks && pdfLinks && (
                    <div>
                        <p className="mt-2 font-medium">References:</p>
                        {videoLinks?.length > 0 && (
                            <ul className="flex flex-col gap-1 pl-1 text-sm break-all truncate whitespace-normal">
                                {videoLinks}
                            </ul>
                        )}
                        {keyframeLinks?.length > 0 && (
                            <ul className="flex flex-col gap-1 pl-1 text-sm break-all truncate whitespace-normal">
                                {keyframeLinks}
                            </ul>
                        )}
                        {pdfLinks?.length > 0 && (
                            <ul className="flex flex-col gap-1 pl-1 text-sm break-all truncate whitespace-normal">
                                {pdfLinks}
                            </ul>
                        )}
                        {imageLinks?.length > 0 && (
                            <ul className="flex flex-col gap-1 pl-1 text-sm break-all truncate whitespace-normal">
                                {imageLinks}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        );

        // Update the messages with the references
        setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            if (newMessages.length > 0) {
                const lastMessageIndex = newMessages.length - 1;
                newMessages[lastMessageIndex] = {
                    ...newMessages[lastMessageIndex],
                    refs,
                    // botText: selectedLanguage == "en" ? data.bot_message : newData.translatedText,
                    text: botMessage,
                    timestamps: timestamps.length > 0 ? [timestamps[0], timestamps[1]] : [],
                };
            }
            return newMessages;
        });


    };

    const [isChatTranslating, setIsChatTranslating] = useState(false);
    const handleLanguageChange = async (chosenLanguage) => {
        try {
            setIsChatTranslating(true);
            setSelectedLanguage(chosenLanguage);
            const data = await makeApiRequest(
                "/translate-chat",
                "post",
                JSON.stringify({
                    queries: messages.filter(msg => msg.sender === "user").map(item => item.question),
                    responses: messages.filter(msg => msg.sender === "bot").map(item => item.botText),
                    language: chosenLanguage,
                })
            );

            let userIndex = 0;
            let botIndex = 0;

            setMessages(
                messages.map((message) => {
                    if (message?.sender === "user") {
                        const updatedMessage = {
                            ...message,
                            text: data.translated_queries[userIndex],
                            question: data.translated_queries[userIndex],
                        };
                        userIndex++;
                        return updatedMessage;
                    } else if (message?.sender === "bot") {

                        const updatedMessage = {
                            ...message,
                            references: message?.references,
                            text: data.translated_responses[botIndex],
                            botText: data.translated_responses[botIndex],
                        };
                        botIndex++;
                        return updatedMessage;
                    } else {
                        return message;
                    }
                })
            );

        } catch (e) {
            console.log(e);
        } finally {
            setIsChatTranslating(false);
        }
    };

    return (
        <div className="h-full px-[18px] min-h-0 flex flex-col overflow-hidden bg-white">
            <div className="pt-4 pb-3 border-b border-border shrink-0">
                <h2 className="font-display text-[14.5px] font-semibold text-ink">Crisp Wiz interaction</h2>
                <p className="text-xs text-ink-secondary mt-0.5">Ask Crisp Wiz questions and interact with your content conversationally.</p>
            </div>

            {messages?.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center gap-2.5 px-6">
                    <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-ink-muted shrink-0">
                        <InfoOutlinedIcon className="mt-0.5 shrink-0" fontSize="small" />
                    </div>
                    <strong className="text-ink text-[13px] font-semibold">Crisp Wiz</strong>
                    <span className="text-[12.5px] text-ink-muted max-w-[260px]">
                        No messages yet. Ask Crisp Wiz a question to start a conversation.
                    </span>
                </div>
            )}

            {messages?.length > 0 && <section
                className={`flex-1 min-h-0 rounded-3xl overflow-hidden ${theme === "light" ? "!border" : "!border !border-textColor-300"
                    }`}
            >
                <div
                    className={`copilot-chat-container relative flex min-h-0 h-full flex-col gap-3 overflow-y-auto ${messages?.length > 0 && 'py-3'}`}
                    ref={chatAppRef}
                >
                    {/* loading overlay */}
                    {isChatTranslating && <div className={`absolute top-0 left-0 flex flex-col items-center justify-center w-full h-full ${theme === 'light' ? 'bg-white/80' : 'bg-black/80'}`}>
                        <div className={`${theme === 'light' ? ' text-textColor-200' : 'text-textColor-100'} rounded-full p-1 w-fit flex items-center gap-1`}>
                            <AutoAwesomeIcon className="animate-fade-in" />
                            <AnimatedText text='Translating chat...' />
                        </div>
                    </div>}
                    {
                        messages.map((message, index) =>
                            index % 2 == 0 ? (
                                <div key={index} className="my-2 break-all w-fit">
                                    <div
                                        className={`message user-message h-full flex flex-col m-2 p-2 shadow-sm rounded-md ${theme === "light"
                                            ? "!border"
                                            : "!border !border-textColor-200/30"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <b className={`${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'} user-select-none`}>You: </b>
                                            {!isProjectReadOnly && <div
                                                className="cursor-pointer"
                                                onClick={() => sendMessage(message?.text, true)}
                                            >
                                                <ReplayOutlinedIcon className={`${theme === 'light' ? 'text-textColor-300' : 'text-textColor-200'}`} />
                                            </div>
                                            }
                                        </div>
                                        <p className="m-0 break-keep text-textColor-300" dangerouslySetInnerHTML={{ __html: message?.text?.replace(/\n/g, '<br>') }}></p>
                                    </div>
                                </div>
                            ) : (
                                <div key={index} className="message bot-message flex-none min-w-0">
                                    <div
                                        key={index}
                                        className={`relative flex flex-col p-2 m-2 rounded-xl break-words shadow-sm !border text-textColor-200 ${sidebarWidth === maxWidth && "!w-2/3 mx-auto"} bg-[radial-gradient(circle_at_20%_20%,rgba(171,95,199,0.10),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(119,83,237,0.08),transparent_45%),radial-gradient(circle_at_50%_80%,rgba(99,102,241,0.06),transparent_50%)] backdrop-blur-sm`}
                                    >

                                        <div className="z-10">
                                            <b
                                                className={`user-select-none text-gradient-x inline-block mb-2`}
                                            >
                                                Crisp Wiz:{" "}
                                            </b>
                                            <div
                                                className={`${theme === "light"
                                                    ? "text-textColor-300"
                                                    : "text-textColor-100"
                                                    } break-words`}
                                            >
                                                <ChatMessage text={message?.botText} refs={message?.refs} timestamps={message?.timestamps} />
                                            </div>
                                            {showCursor && index == responseIndex ? (
                                                <div className={`${theme === 'light' ? ' text-textColor-200' : 'text-textColor-100'} rounded-full p-1 w-fit flex items-center gap-1`}>
                                                    <AutoAwesomeIcon className="animate-fade-in" />
                                                    <AnimatedText text='Thinking...' />
                                                </div>
                                            ) : null}
                                            {
                                                (!isFoundationLlm && isFetchingRefs && index == responseIndex) && <AnimatedText text='Fetching references...' />
                                            }
                                        </div>
                                    </div>
                                </div>
                            )
                        )
                        // )
                    }
                </div>
            </section>}

            <section className="flex shrink-0 copilot-chat-container mt-2 input-area max-w-[1000px] flex-col">

                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">

                        {messages.length > 0 && <div className={`flex flex-wrap rounded-full items-center !border w-fit ${theme === 'light' ? "!border !border-textColor-100/70 bg-light-hover-100/30" : "!border !border-textColor-300 bg-light-hover-200/20 text-textColor-100"}`}>
                            <LanguageOutlinedIcon className={`${theme === 'light' ? '#333' : '#ABAEB4'} ml-1`} />
                            <CustomSelectTwo
                                options={languageOptions}
                                onChange={(chosenLanguage) => handleLanguageChange(chosenLanguage.value)}
                                placeholder='Select a language'
                                withIcon
                            />
                        </div>
                        }
                    </div>
                    <div className="mb-5 rounded-3xl" ref={crispWizInputContainerRef}>
                        <ChatInput
                            handleKeyDown={(e) => handleKeyDown(e)}
                            onSend={(message) => sendMessage(message)}
                            value={input}
                            crispWizInputRef={crispWizInputRef}
                            crispWizInputContainerRef={crispWizInputContainerRef}
                            onChange={value => setInput(value)}
                            showCursor={showCursor}
                            isFetchingRefs={isFetchingRefs}
                            sourceIds={sourceIds}
                            setSourceIds={setSourceIds}
                        />
                    </div>
                </div>

            </section>
        </div>
    );
};

export default Interaction;
