import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import SendIcon from "@mui/icons-material/Send";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import axios from "axios";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import makeApiRequest from "../../api";
import { MainContext } from "../../contexts/mainContext";
import { decimalSecondsToHHMMSS, delay, generateRandomHash, timeToSeconds, toBase64 } from '../../utils';
import AddOptionsModal from "../AddOptionsModal";
import CustomSelectTwo from '../CustomSelectTwo';
import { EventSourcePolyfill } from 'event-source-polyfill';
import ImageUpload from '../ImageUpload';
import PreviewModal from '../PreviewModal';

import useReferenceLinkClick from "../../hooks/useReferenceLinkClick.js";
import { useResizableSidebar } from '../../hooks/useResizableSidebar.js';
import AnimatedText from '../AnimatedText/index.jsx';
import AnimatedInput from '../AnimatedInput/index.jsx';
import Chip from '../Chip/index.jsx';
import { TOKEN_NAME } from '../../globals.js';
import useAuth from '../../hooks/useAuth.js';
import HorizontalChatHistoryList from '../HorizontalChatHistoryList/index.jsx';
import ChatHistory from '../ChatHistory/index.jsx';
import BaseHeading from "../BaseHeading";
import toast from 'react-simple-toasts';
import { ProjectContext } from '../../contexts/projectContext.jsx';
import useChat from '../../hooks/useChat.js';
import ChatInput from '../ChatInput/index.jsx';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

const ChatMessage = ({ text, refs }) => {
  const { handlePDFLinkClick, handleVideoLinkClick } = useReferenceLinkClick(true);
  return (
    <div>
      <div className="coorg-response break-keep">
        {text}
      </div>
      <div>
        {(refs?.videoLinks?.length > 0 ||
          refs?.keyframeLinks?.length > 0 ||
          refs?.pdfLinks?.length > 0 ||
          refs?.imageLinks?.length > 0) && (
            <p className="mt-2 font-medium">References:</p>
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
                  onClick={(e) => handleVideoLinkClick(e, video)}
                  cssClasses="ml-0 cursor-pointer break-keep"
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
                onClick={(e) => handleVideoLinkClick(e, video)}
                cssClasses="ml-0 cursor-pointer  break-keep"
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
                content={`${pdf.source_path} | Page: ${parseInt(pdf.page, 10) + 1}`}
                data-object={pdf}
                onClick={(e) => handlePDFLinkClick(e, pdf)}
                cssClasses="ml-0 cursor-pointer  break-keep"
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
                onClick={(e) => handlePDFLinkClick(e, img)}
                cssClasses="ml-0 cursor-pointer  break-keep"
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const CopilotSection = ({ selectedLanguage, setSelectedLanguage, sidebarWidth, combinedSummary, setCombinedSummary, setIsCombinedSummaryPending, messages, setMessages }) => {
  const {
    theme,
    currentResource,
    llmModels,
    chatLoaded,
    selectedCategory,
    fromChat, setFromChat,
    isFoundationLlm,
    resourceURL,
    workspaceContainer,
    noteReferences,
    player,
    isPlayerReady,
    notes,
    setNotes,
    selectedNote,
    setSelectedNote,
    showNoteModal,
    setCurrentChat,
    setNoteIndex,
    setShowNoteModal,
    displayedSources, setShowEditor,
    isNewNote,
    setIsNewNote,
    languageOptions, setIsManualNote,
    setShowNoteDetails,
    setActiveView,
    currentChat,
    chatHistory,
    setChatHistory,
  } = useContext(MainContext);

  const { currentProject } = useContext(ProjectContext);

  const { token } = useAuth();

  const { addNewChat } = useChat();

  const { maxWidth } = useResizableSidebar(200, false);

  const { handlePDFLinkClick, handleVideoLinkClick } = useReferenceLinkClick(true);

  const chatAppRef = useRef();

  // const [messages, setMessages] = useState(currentChat?.messages || []);
  const [responseIndex, setResponseIndex] = useState(currentChat?.messages?.length - 1 || -1);
  useEffect(() => {
    setMessages(currentChat?.messages || []);
    setResponseIndex(currentChat?.messages?.length - 1 || -1);
  }, [currentChat]);
  const [input, setInput] = useState("");

  // const [selectedLanguage, setSelectedLanguage] = useState("en"); // chat default language

  const [originalQueries, setOriginalQueries] = useState([]);
  const [originalResponses, setOriginalResponses] = useState([]);

  const crispWizInputRef = useRef(null);
  const crispWizInputContainerRef = useRef(null);

  const [existingNote, setExistingNote] = useState(0);

  const existingNoteRef = useRef(existingNote);

  const [showCursor, setShowCursor] = useState(false);

  // For GPT-4-Vision
  const [, setIsUploadingVisionImg] = useState(false);

  // For LLM Model Selction from the popup modal
  const [selectedLLMs, setSelectedLLMs] = useState([llmModels[0].value]); // State to track multiple selected LLMs

  useEffect(() => {
    if (messages?.length > 0) {// chatAppRef.current?.scrollIntoView({ behavior: 'smooth' });
      chatAppRef.current.scrollTop = chatAppRef?.current?.scrollHeight;
      // workspaceContainer.current.scrollTop = workspaceContainer.current?.scrollHeight;
      workspaceContainer.current.scrollTo({
        top: workspaceContainer.current?.scrollHeight,
        behavior: "smooth", // Enables smooth scrolling
      });
    }
  }, [messages]);

  useEffect(() => {
    if (
      fromChat &&
      isPlayerReady &&
      resourceURL &&
      currentResource.file_type === "video"
    ) {
      const timestamp = currentResource?.timestamp; // Make sure you have the timestamp here
      if (timestamp !== undefined && timestamp !== null) {
        player.current.seekTo(typeof timestamp === "number" ? timestamp : timeToSeconds(timestamp));
      }
      setFromChat(false);
    }
  }, [isPlayerReady, currentResource, currentResource?.timestamp]);

  let noteQuestion = useRef('');

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

  const sendMessage = async (message, models = selectedLLMs[0], isRepeated = false) => {

    if (message.trim() === "" && input.trim() === "") return;

    if (input.trim() === '' && !isRepeated) return;

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

    noteQuestion.current = userMessage;

    setInput("");

    setOriginalQueries([...originalQueries, userMessage]);
    setMessages([
      ...messages,
      { sender: "user", text: userMessage, models, question: userMessage },
      { sender: "bot", text: "", models, question: userMessage, botText: "", refs: {} },
    ]);
    setResponseIndex((responseIndex) => responseIndex + 2);

    var botMessage = "";
    if (selectedLLMs[0] === "dall-e-3") {
      const data = await makeApiRequest(
        `/image-generation/${encodeURIComponent(
          selectedCategory
        )}/${encodeURIComponent(userMessage)}/${encodeURIComponent(
          selectedLLMs[0]
        )}`,
        "post"
      );
      botMessage = data.image_url;

      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        if (newMessages.length > 0) {
          const lastMessageIndex = newMessages.length - 1;
          newMessages[lastMessageIndex] = {
            ...newMessages[lastMessageIndex],
            img: botMessage,
          };
        }
        return newMessages;
      });
      setShowCursor(false);
    } else {

      // add or remove embeddings from VS
      if (!displayedSources?.every(item => item?.is_checked === false)) {
        await makeApiRequest(
          `/handle-embeddings`,
          "post",
          JSON.stringify({
            sources: displayedSources?.filter(item => item?.is_checked)?.map(item => ({ source_path: item?.source_path, category: item?.category })),
          })
        );
      }

      let sessionID = null; // Variable to store the session ID
      const eventSource = new EventSourcePolyfill(`${API_ENDPOINT}/message/${encodeURIComponent(userMessage?.replace(/\n/g, ' '))}/${displayedSources?.some(item => item?.is_checked) ? false : true}`, {
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
          botMessage += " " + newToken;
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
          fetchReferences(userMessage, models, botMessage, data.data);
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
    }


  };
  const fetchReferences = async (userMessage, models, botMessage, data) => {
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
      addNewChat("New Chat " + (chatHistory.length + 1), [{ sender: "user", text: userMessage, question: userMessage, models }, { sender: "bot", text: botMessage, botText: botMessage, question: userMessage, models, refs }]);
    } else {
      setChatHistory(prev => {
        const chatToUpdate = prev[chatIndex];
        chatToUpdate.messages = [...chatToUpdate.messages, { sender: "user", text: userMessage, question: userMessage, models }, { sender: "bot", text: botMessage, botText: botMessage, question: userMessage, models, refs }];
        const { isTemp, ...rest } = chatToUpdate;
        prev[chatIndex] = rest;
        return prev;
      });
      setCurrentChat(chatHistory[chatIndex]);
    }

    // update currentChat and chatHistory
    // setCurrentChat(prev => ({
    //   ...prev,
    //   messages: prev.messages.map((message, index) => {
    //     if (index === responseIndex) {
    //       return {
    //         ...message,
    //         botText: botMessage,
    //         text: botMessage,
    //         refs,
    //       };
    //     }
    //     return message;
    //   })
    // }));
    // setChatHistory(prevChatHistory => {
    //   return prevChatHistory.map(chat => {
    //     if (chat.sessionId === currentChat.sessionId) {
    //       return {
    //         ...chat,
    //         messages: chat.messages.map((message, index) => {
    //           if (index === responseIndex) {
    //             return {
    //               ...message,
    //               botText: botMessage,
    //               text: botMessage,
    //               refs,
    //             };
    //           }
    //           return message;
    //         })
    //       };
    //     }
    //     return chat;
    //   });
    // });

    const videoLinks = data.video_references.map((video) => {
      noteReferences.videoLinks.push(video.source_path + " | Timestamp: " + video.timestamp);
      refs["videoLinks"].push(video);
      return (
        <Chip key={video.source_path} content={video.source_path + " | Timestamp: " + video.timestamp} data-object={video} onClick={(event) => handleVideoLinkClick(event, video)} cssClasses="ml-0 cursor-pointer" />
        // <li key={video.source_path} className="ml-0" data-object={video}>
        //   <Link onClick={(event) => handleVideoLinkClick(event, video)}>
        //     {video.source_path + " | Timestamp: " + video.timestamp}
        //   </Link>
        // </li>
      );
    });

    const keyframeLinks = data.keyframe_references.map((video) => {
      noteReferences.keyframeLinks.push(video.source_path + " | Keyframe at: " + decimalSecondsToHHMMSS(video.timestamp));
      refs["keyframeLinks"].push(video);
      return (
        <Chip key={video.source_path} content={video.source_path + " | keyframe at: " + decimalSecondsToHHMMSS(video.timestamp)} data-object={video} onClick={(event) => handleVideoLinkClick(event, video)} cssClasses="ml-0 cursor-pointer" />
        // <li key={video.source_path} className="ml-0" data-object={video}>
        //   <Link onClick={(event) => handleVideoLinkClick(event, video)}>
        //     {video.source_path + " | keyframe at: " + decimalSecondsToHHMMSS(video.timestamp)}
        //   </Link>
        // </li>
      );
    });

    const pdfLinks = data.pdf_references.map((pdf) => {
      noteReferences.pdfLinks.push(pdf.source_path + " | Page: " + (parseInt(pdf.page) + 1));
      refs["pdfLinks"].push(pdf);
      return (
        <Chip key={pdf.source_path} content={pdf.source_path + " | Page: " + (parseInt(pdf.page) + 1)} data-object={pdf} onClick={(event) => handlePDFLinkClick(event, pdf)} cssClasses="ml-0 cursor-pointer" />
        // <li key={pdf.source_path} className="ml-0" data-object={pdf}>
        //   <Link onClick={(event) => handlePDFLinkClick(event, pdf)}>
        //     {pdf.source_path + " | Page: " + (parseInt(pdf.page) + 1)}
        //   </Link>
        // </li>
      );
    });

    const imageLinks = data.img_references.map((img) => {
      noteReferences.imageLinks.push(img.source_path);
      refs["imageLinks"].push(img);
      return (
        <Chip key={img.source_path} content={img.source_path} data-object={img} onClick={(event) => handlePDFLinkClick(event, img)} cssClasses="ml-0 cursor-pointer" />
        // <li key={img.source_path} className="ml-0" data-object={img}>
        //   <Link onClick={(event) => handlePDFLinkClick(event, img)}>
        //     {img.source_path}
        //   </Link>
        // </li>
      );
    });

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
        <AddOptionsModal
          text={
            selectedLanguage == "en" ? data.bot_message : newData.translatedText
          }
          addToNewNote={addToNewNote}
          refs={refs}
          addToExistingNote={addToExistingNote}
          setExistingNote={setExistingNote}
          question={noteQuestion.current}
          existingNote={existingNote}
          onHide={onHide}
          isNewNote={isNewNote}
          setShowNoteModal={setShowNoteModal}
          updateSelectedNote={setSelectedNote}
          showNoteModal={showNoteModal}
          selectedNote={selectedNote}
          notes={notes}
        />
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
      setIsCombinedSummaryPending(true);
      const data = await makeApiRequest(
        "/translate-chat",
        "post",
        JSON.stringify({
          queries: messages.filter(msg => msg.sender === "user").map(item => item.question),
          responses: messages.filter(msg => msg.sender === "bot").map(item => item.botText),
          language: chosenLanguage,
          combinedSummary,
        })
      );

      let userIndex = 0;
      let botIndex = 0;

      setMessages(
        messages.map((message, index) => {
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

      setCombinedSummary(data?.translated_combined_summary);
    } catch (e) {
      console.log(e);
    } finally {
      setIsCombinedSummaryPending(false);
      setIsChatTranslating(false);
    }
  };

  const addToNewNote = async (textToAdd, file, question = '', models = selectedLLMs, refs = { pdfLinks: [], videoLinks: [], imageLinks: [] }) => {
    const newText = {
      id: generateRandomHash(5),
      model: models[0] || "",
      question,
      answer: textToAdd,
      refs,
    };
    const newNote = {
      ...selectedNote,
      note_name: `new title ${Math.floor(Math.random() * 100)}`,
      text: [{
        ...newText
      }]
    };
    setIsNewNote(true);
    setNoteIndex(notes.length);
    setSelectedNote(newNote);
    setIsManualNote(false);
    setShowNoteDetails(true);
    setShowEditor(true);
    // setActiveView('note');
  };

  useEffect(() => {
    noteQuestion.ref = input;
  }, [input]);

  useEffect(() => {
    existingNoteRef.current = existingNote;
  }, [setExistingNote, existingNote]);

  const latestNotes = useRef(notes);
  useEffect(() => {
    latestNotes.current = notes;
  }, [notes]);

  const addToExistingNote = async (newTextContent, file, question = '', models = selectedLLMs, refs) => {
    // if (file) {
    //   imgUrl = await toBase64(file);
    // }

    const newNoteTextEntry = {
      id: generateRandomHash(5),
      model: models[0],
      question,
      answer: newTextContent,
      refs
    };

    if (Array.isArray(latestNotes.current[existingNoteRef.current]?.text)) {
      // latestNotes.current[existingNoteRef.current].text.push(newNoteTextEntry);
      setSelectedNote(prev => {
        return {
          ...prev,
          text: [...prev.text, newNoteTextEntry]
        };
      });
    } else {
      // latestNotes.current[existingNoteRef.current].text = [newNoteTextEntry];
      setSelectedNote(prev => {
        return {
          ...prev,
          text: [newNoteTextEntry]
        };
      });
    }
    // Update the selectedNote with the updated note
    // setSelectedNote(latestNotes.current[existingNoteRef.current]);
    setIsNewNote(false); // Since we are updating an existing note, it's not a new note
    setIsManualNote(false);
    setShowNoteDetails(true);
    setActiveView('note');
  };

  const onHide = () => {
    setShowNoteModal(false);

    fetch(`${API_ENDPOINT}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setNotes(data);
      })
      .catch((error) => console.error(error))
      .finally(() => {
        setSelectedNote({
          note_id: "",
          text: [{
            content: "", model: null, color: theme === 'light' ? "#333" : '#fff', question: '', refs: {
              videoLinks: [],
              keyframeObjects: [],
              pdfObjects: [],
              imageObjects: [],
            }
          }],
          images: [],
          note_name: "",
        });
      });
    setIsNewNote(false);
  };

  const handleVisionUpload = async (images, query) => {
    if (!chatLoaded) return;
    setShowCursor(true);
    const base64Imgs = await Promise.all(images.map(async (image) => await toBase64(image)));
    const userMessage = {
      query,
      imgs_list: images
    };

    setOriginalQueries([...originalQueries, userMessage]);

    setMessages([
      ...messages,
      { sender: "user", text: userMessage, models: ['gpt-4-vision'] },
      { sender: "bot", text: "", models: ['gpt-4-vision'] },
    ]);
    setResponseIndex((responseIndex) => responseIndex + 2);

    try {
      const response = await axios.post(
        `${API_ENDPOINT}/upload-and-caption`,
        { ...userMessage, imgs_list: base64Imgs }
      );

      //     // Assuming the response contains the caption
      const caption = response.data.answer;
      const botMessage = (
        <div>
          <p>{caption}</p>
          <AddOptionsModal
            text={caption}
            models={["gpt-4-vision"]}
            addToNewNote={addToNewNote}
            addToExistingNote={addToExistingNote}
            setExistingNote={setExistingNote}
            question={userMessage}
            existingNote={existingNote}
            onHide={onHide}
            isNewNote={isNewNote}
            setShowNoteModal={setShowNoteModal}
            updateSelectedNote={setSelectedNote}
            showNoteModal={showNoteModal}
            selectedNote={selectedNote}
            notes={notes}
          />
        </div>
      );
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        if (newMessages.length > 0) {
          const lastMessageIndex = newMessages.length - 1;
          newMessages[lastMessageIndex] = {
            ...newMessages[lastMessageIndex],
            text: botMessage,
          };
        }
        return newMessages;
      });
    } catch (error) {
      console.error("Error uploading and captioning image:", error);
    }
    setShowCursor(false);
    setIsUploadingVisionImg(false);
  };

  const handleRepeatQuestion = (message, model, isRepeated = true) => {
    // setInput(message);
    if (model === 'gpt-4-vision') {
      handleVisionUpload(null, message);
      return;
    }

    if (model === 'dall-e-3') {
      sendMessage(message, model);
      return;
    }

    if (model !== 'dall-e-3' && model !== 'gpt-4-vision') {
      sendMessage(message, model, isRepeated);
      return;
    }
  };

  const [isLightboxOpen, setLightboxOpen] = useState(false);

  const openLightbox = () => {
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const [imagePreviewIndex, setImagePreviewIndex] = useState(-1);
  const showImageInPreview = (index) => {
    setLightboxOpen(true);
    setImagePreviewIndex(index);
  };

  const [start, setStart] = useState({ h: "00", m: "00", s: "00" });
  const [end, setEnd] = useState({ h: "00", m: "00", s: "00" });
  const [isTimestampPickerOpen, setIsTimestampPickerOpen] = useState(false);

  return (
    <article className="relative flex flex-col flex-1 mb-3 h-full max-w-[650px] mx-auto ">
      <section className={`flex flex-wrap items-center gap-3 ${messages.length > 0 && 'mb-3'}`}>
        {
          notes.map((note, i) => {
            <p key={i}>{note.note_name}</p>;
          })
        }
        {(combinedSummary !== "" || messages.length > 0) && <div className={`flex flex-wrap rounded-full items-center !border w-fit ${theme === 'light' ? "!border !border-textColor-100/70 bg-light-hover-100/30" : "!border !border-textColor-300 bg-light-hover-200/20 text-textColor-100"}`}>
          <LanguageOutlinedIcon className={`${theme === 'light' ? '#333' : '#ABAEB4'} ml-1`} />
          <CustomSelectTwo
            options={languageOptions}
            onChange={(chosenLanguage) => handleLanguageChange(chosenLanguage.value)}
            placeholder='Select a language'
            withIcon
          />
        </div>}

        {/* <div className="models-list-button">
          <CustomButton
            className={`my-0 ${theme === "light"
              ? "bg-light-hover-100/30 !text-dark border border-textColor-100"
              : " !text-textColor-100 !border bg-light-hover-200/20 !border-textColor-300"
              }`}
            style={{ width: "100%" }}
            onClick={selectLLMModels}
          >
            Models
          </CustomButton>
        </div>
        <LLMModal
          show={showLLMModal}
          onHide={onHideLLMModal}
          selectedLLMs={selectedLLMs}
          setSelectedLLMs={setSelectedLLMs}
          llmModels={llmModels}
          className="modal"
        /> */}
      </section>
      {/* <div className="flex items-center flex-1 gap-3"> */}
      {messages?.length > 0 && <section
        className={`copilot-chat-container relative flex flex-col  gap-3 overflow-x-hidden  ${messages?.length > 0 && 'py-3'} ${theme === "light" ? "!border" : "!border !border-textColor-300"
          } ${isChatTranslating ? '' : 'h-[700px] overflow-y-auto'}`}
        ref={chatAppRef}
      >
        {/* loading overlay */}
        {isChatTranslating && <div className={`absolute top-0 left-0 flex flex-col items-center justify-center w-full h-[700px] ${theme === 'light' ? 'bg-white/80' : 'bg-black/80'}`}>
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
                  className={`message user-message h-full flex flex-col m-2 p-2  bg-primary-300 text-white rounded-md`}
                >
                  {
                    message?.models?.includes('gpt-4-vision')
                      ? (
                        <>
                          <div className="flex items-center justify-between">
                            <b className="user-select-none">You: </b>
                            <div
                              className="cursor-pointer"
                              onClick={() => {
                                handleVisionUpload(message?.text?.images, message?.text?.query);
                              }}
                            >
                              <ReplayOutlinedIcon />
                            </div>
                          </div>
                          <div>
                            {
                              message?.text?.imgs_list.map((img, index) => {
                                return (
                                  <img src={URL.createObjectURL(img)} key={img.name} alt='uploaded image' className='flex-1 mb-2 cursor-pointer' onClick={() => showImageInPreview(index)} />
                                );
                              })
                            }
                            <p className="break-words break-keep">{message?.text?.query}</p>
                            {/* <p>{message?.text}</p> */}
                          </div>
                          {isLightboxOpen && (
                            <PreviewModal closeLightbox={closeLightbox} content={URL.createObjectURL(message?.text?.imgs_list[imagePreviewIndex])} />
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <b className="user-select-none">You: </b>
                            <div
                              className="cursor-pointer"
                              onClick={() => {
                                handleRepeatQuestion(message?.text, message?.model, true);
                              }}
                            >
                              <ReplayOutlinedIcon />
                            </div>
                          </div>
                          <div>{message?.text?.startsWith('blob') ? (<img src={message?.text} alt='uploaded image' className='flex-1' />) : (<p className="m-0 break-keep" dangerouslySetInnerHTML={{ __html: message?.text?.replace(/\n/g, '<br>') }}></p>)}</div>
                        </>
                      )
                  }
                </div>
              </div>
            ) : (
              <div key={index}>
                <div className={`message bot-message h-full`}>
                  <div
                    className={`flex flex-col h-full p-2 m-2 rounded-md break-words ${theme === "light"
                      ? "bg-separator text-textColor-200"
                      : "bg-background_workspace"
                      } ${sidebarWidth === maxWidth && '!w-2/3 mx-auto'}`}
                  >
                    {message?.models?.includes("dall-e-3") && message?.img ? (
                      <>
                        <b
                          className={`user-select-none ${theme === "light"
                            ? "text-textColor-300"
                            : "text-textColor-100"
                            }`}
                        >
                          Crisp Wiz:{" "}
                        </b>
                        <div className="flex flex-col flex-1">
                          <img
                            src={message?.img}
                            alt="Image is Loading ..."
                            onClick={openLightbox}
                            className="flex-1 mx-auto cursor-pointer"
                          />
                          <div className="flex flex-wrap items-center gap-1 mt-3">
                            <span
                              className={`text-xs ${theme === "light"
                                ? "text-textColor-300"
                                : "text-textColor-200"
                                }`}
                            >
                              <AddOptionsModal
                                models={["dall-e-3"]}
                                text={message?.img}
                                addToNewNote={addToNewNote}
                                addToExistingNote={addToExistingNote}
                                setExistingNote={setExistingNote}
                                question={message?.question}
                                existingNote={existingNote}
                                onHide={onHide}
                                isNewNote={isNewNote}
                                setShowNoteModal={setShowNoteModal}
                                updateSelectedNote={setSelectedNote}
                                showNoteModal={showNoteModal}
                                selectedNote={selectedNote}
                                notes={notes} />
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1 mt-3">
                            <span
                              className={`text-xs ${theme === "light"
                                ? "text-textColor-300"
                                : "text-textColor-200"
                                }`}
                            >
                              {message?.models?.map((item, index) => (
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
                            </span>
                          </div>
                          {isLightboxOpen && (
                            <PreviewModal closeLightbox={closeLightbox} content={message?.img} />
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <b
                          className={`user-select-none ${theme === "light"
                            ? "text-textColor-300"
                            : "text-textColor-100"
                            }`}
                        >
                          Crisp Wiz:{" "}
                        </b>
                        <div
                          className={`${theme === "light"
                            ? "text-textColor-300"
                            : "text-textColor-100"
                            } break-words`}
                        >
                          <ChatMessage text={message?.botText} refs={message?.refs} />
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

                        <AddOptionsModal
                          text={
                            message?.botText
                          }
                          addToNewNote={addToNewNote}
                          refs={message?.refs}
                          addToExistingNote={addToExistingNote}
                          setExistingNote={setExistingNote}
                          question={noteQuestion.current}
                          existingNote={existingNote}
                          onHide={onHide}
                          isNewNote={isNewNote}
                          setShowNoteModal={setShowNoteModal}
                          updateSelectedNote={setSelectedNote}
                          showNoteModal={showNoteModal}
                          selectedNote={selectedNote}
                          notes={notes}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          )
          // )
        }
      </section>}

      {/* </div> */}
      <section className="flex copilot-chat-container input-area max-w-[1000px] flex-col">

        <div className="flex items-center justify-between">
          <ChatHistory crispWizInputRef={crispWizInputRef} crispWizInputContainerRef={crispWizInputContainerRef} />
        </div>
        {
          selectedLLMs[0] === 'gpt-4-vision'
            ?
            <ImageUpload handleUpload={handleVisionUpload} />
            :
            <div className="mb-5 rounded-full" ref={crispWizInputContainerRef}>
              <ChatInput
                handleKeyDown={(e) => handleKeyDown(e)}
                onSend={(message) => sendMessage(message)}
                placeholder={displayedSources.length > 0 ? "Interact" : "Ask Crisp Wiz anything…"}
                value={input}
                inputRef={crispWizInputRef}
                onChange={value => setInput(value)}
              />
            </div>
          // <div ref={crispWizInputContainerRef} className={`flex items-center gap-2 w-full mt-1 mb-4 flex-1 mx-auto ${theme === 'light' ? "!border !border-textColor-100" : "!border !border-textColor-300"} rounded-full`}>
          //   <textarea
          // placeholder={displayedSources.length > 0 ? "Interact" : "Ask Crisp Wiz anything…"}
          // value={input}
          //     rows="1"
          // ref={crispWizInputRef}
          // disabled={showCursor}
          // onChange={e => setInput(e.target.value)}
          //     className={`!flex-1 pr-2 py-3 !pl-4 rounded-full bg-transparent outline-none`}
          // onKeyDown={(e) => {
          //   if (e.key === "Enter" && !e.shiftKey) {
          //     sendMessage(input);
          //   }
          // }} />
          // <div
          //   className={`p-2 mr-4 text-sm cursor-pointer bg-textColor-300 text-white/80 rounded-full`}
          //   onClick={(e) => { sendMessage(input); e.target.value = e.target.value?.replace(/(\r\n|\n\r)/gm, ""); }}
          // >
          //   <SendIcon className={``} />
          // </div>
          // </div>
        }

      </section>


    </article >
  );
};

export default CopilotSection;
