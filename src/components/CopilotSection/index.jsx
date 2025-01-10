import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import makeApiRequest from "../../api";
import { MainContext } from "../../contexts/mainContext";
import { decimalSecondsToHHMMSS, generateRandomHash, timeToSeconds, toBase64 } from '../../utils';
import AddOptionsModal from "../AddOptionsModal";
import CustomButton from "../CustomButton";
import CustomSelectTwo from '../CustomSelectTwo';
import CustomTextArea from '../CustomTextArea';
import ImageUpload from '../ImageUpload';
import { LLMModal } from "../LLMModal";
import LoadingSpinner from "../LoadingSpinner";
import PreviewModal from '../PreviewModal';

import useReferenceLinkClick from "../../hooks/useReferenceLinkClick.js";
import { useResizableSidebar } from '../../hooks/useResizableSidebar.js';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
const CopilotSection = ({ chatLoaded, setChatLoaded, sidebarWidth }) => {
  const {
    theme,
    currentResource,
    llmModels,
    fromChat, setFromChat,
    isFoundationLlm,
    resourceURL,
    noteReferences,
    player,
    isPlayerReady,
    notes,
    setNotes,
    selectedNote,
    setSelectedNote,
    showNoteModal,
    setNoteIndex,
    setShowNoteModal,
    selectedSources,
    selectedAll,
    isNewNote,
    setIsNewNote,
    languageOptions, setIsManualNote,
    setShowNoteDetails,
    setActiveView
  } = useContext(MainContext);

  const { maxWidth } = useResizableSidebar(200, false);

  const { handlePDFLinkClick, handleVideoLinkClick } = useReferenceLinkClick(true);

  const chatAppRef = useRef();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const [selectedLanguage, setSelectedLanguage] = useState("en"); // chat default language

  const [originalQueries, setOriginalQueries] = useState([]);
  const [originalResponses, setOriginalResponses] = useState([]);
  const [responseIndex, setResponseIndex] = useState(-1);
  const [selectedCategoryChat] = useState("all");

  const [existingNote, setExistingNote] = useState(0);

  const existingNoteRef = useRef(existingNote);

  const [showCursor, setShowCursor] = useState(false);

  // For GPT-4-Vision
  const [, setIsUploadingVisionImg] = useState(false);

  // For LLM Model Selction from the popup modal
  const [selectedLLMs, setSelectedLLMs] = useState([llmModels[0].value]); // State to track multiple selected LLMs
  const [showLLMModal, setShowLLMModal] = useState(false);

  useEffect(() => {
    // chatAppRef.current?.scrollIntoView({ behavior: 'smooth' });
    chatAppRef.current.scrollTop = chatAppRef.current?.scrollHeight;
  }, [messages]);

  useEffect(() => {
    setChatLoaded(false);

    async function fetchChat() {
      const data = await makeApiRequest(
        `/chat/${selectedCategoryChat}`,
        "post",
        JSON.stringify({
          sources: selectedSources,
          category: selectedCategoryChat,
          selectedAll,
        })
      );
      setChatLoaded(data?.chat_is_initialized);
    }

    fetchChat();
  }, [selectedCategoryChat, selectedSources]);

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
  const sendMessage = async (message, models = selectedLLMs) => {
    if (!chatLoaded) return;

    if (message === "" && input === "") {
      return;
    }

    // const validatedInput = input.replace('\n', ' ');
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

    userMessage = userMessage.trim();

    noteQuestion.current = userMessage;

    setOriginalQueries([...originalQueries, userMessage]);
    setMessages([
      ...messages,
      { sender: "user", text: userMessage, models, question: userMessage },
      { sender: "bot", text: "", models, question: userMessage },
    ]);
    setResponseIndex((responseIndex) => responseIndex + 2);

    var botMessage = "";
    if (selectedLLMs[0] === "dall-e-3") {
      const data = await makeApiRequest(
        `/image-generation/${encodeURIComponent(
          selectedCategoryChat
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

      let sessionID = null; // Variable to store the session ID
      const eventSource = new EventSource(
        `${API_ENDPOINT}/message/${encodeURIComponent(
          selectedCategoryChat
        )}/${encodeURIComponent(userMessage.replace(/\n/g, ' '))}/${encodeURIComponent(
          selectedLLMs[0]
        )}/${isFoundationLlm}`
      );

      eventSource.onmessage = function (event) {
        const data = JSON.parse(event.data);

        if (data.type === "SESSION_ID") {
          sessionID = data.session_id;
        } else if (data.type === "MESSAGE") {
          const newToken = data.text;
          botMessage += " " + newToken;
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
        }
      };

      eventSource.onerror = function () {
        setShowCursor(false);
        eventSource.close();

        if (eventSource.readyState === EventSource.CLOSED) {
          // Extract session ID from the eventSource's URL
          fetchReferences(botMessage); // Function to fetch references
          setOriginalResponses([...originalResponses, botMessage]);
        } else {
          console.error("Connection was closed due to an error.");
        }
      };
    }

    setInput("");
  };

  // const handleVideoLinkClick = (event, video) => {
  //   event.preventDefault();
  //   setFromChat(true);
  //   const resourceURL = `${API_ENDPOINT}/${video.file_type
  //     }/all/${encodeURIComponent(video.source_path)}`;
  //   setCurrentResource({ ...video });
  //   setResourceURL(resourceURL);
  //   setSummary(video.summary);
  //   setSummaries(video.topic_summaries);
  //   setActiveView('resource');
  //   // setShowNoteDetails(false);
  // };

  // const handlePDFLinkClick = (event, pdf) => {
  //   event.preventDefault();
  //   const resourceURL = `${API_ENDPOINT}/${pdf.file_type
  //     }/all/${encodeURIComponent(pdf.source_path)}`;
  //   setCurrentResource({ ...pdf });
  //   setResourceURL(resourceURL);
  //   setSummary(pdf.summary);
  //   setSummaries(pdf.topic_summaries);
  //   setActiveView('resource');
  //   setJumpToPage({ page: parseInt(pdf.page) + 1 });
  //   // setShowNoteDetails(false);
  // };

  const fetchReferences = async (botMessage) => {
    const response = await axios.get(`${API_ENDPOINT}/references`);
    const data = response.data;
    noteReferences.videoLinks = [];
    noteReferences.pdfLinks = [];
    noteReferences.imageLinks = [];
    noteReferences.keyframeLinks = [];

    let refs = {
      videoObjects: [],
      keyframeObjects: [],
      pdfObjects: [],
      imageObjects: [],
    };

    const videoLinks = data.video_references.map((video) => {
      noteReferences.videoLinks.push(video.source_path + " | Timestamp: " + video.timestamp);
      refs["videoObjects"].push(video);
      return (
        <li key={video.source_path} className="ml-0" data-object={video}>
          <Link onClick={(event) => handleVideoLinkClick(event, video)}>
            {video.source_path + " | Timestamp: " + video.timestamp}
          </Link>
        </li>
      );
    });

    const keyframeLinks = data.keyframe_references.map((video) => {
      noteReferences.keyframeLinks.push(video.source_path + " | Keyframe at: " + decimalSecondsToHHMMSS(video.timestamp));
      refs["keyframeObjects"].push(video);
      return (
        <li key={video.source_path} className="ml-0" data-object={video}>
          <Link onClick={(event) => handleVideoLinkClick(event, video)}>
            {video.source_path + " | keyframe at: " + decimalSecondsToHHMMSS(video.timestamp)}
          </Link>
        </li>
      );
    });

    const pdfLinks = data.pdf_references.map((pdf) => {
      noteReferences.pdfLinks.push(pdf.source_path + " | Page: " + (parseInt(pdf.page) + 1));
      refs["pdfObjects"].push(pdf);
      return (
        <li key={pdf.source_path} className="ml-0" data-object={pdf}>
          <Link onClick={(event) => handlePDFLinkClick(event, pdf)}>
            {pdf.source_path + " | Page: " + (parseInt(pdf.page) + 1)}
          </Link>
        </li>
      );
    });

    const imageLinks = data.img_references.map((img) => {
      noteReferences.imageLinks.push(img.source_path);
      refs["imageObjects"].push(img);
      return (
        <li key={img.source_path} className="ml-0" data-object={img}>
          <Link onClick={(event) => handlePDFLinkClick(event, img)}>
            {img.source_path}
          </Link>
        </li>
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
        {!isFoundationLlm && videoLinks && keyframeLinks && pdfLinks && (
          <div>
            <p className="m-0">References:</p>
            {videoLinks && (
              <ul className="pl-1 text-sm break-all truncate whitespace-normal">
                {videoLinks}
              </ul>
            )}
            {keyframeLinks && (
              <ul className="pl-1 text-sm break-all truncate whitespace-normal">
                {keyframeLinks}
              </ul>
            )}
            {pdfLinks && (
              <ul className="pl-1 text-sm break-all truncate whitespace-normal">
                {pdfLinks}
              </ul>
            )}
            {imageLinks && (
              <ul className="pl-1 text-sm break-all truncate whitespace-normal">
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
          text: botMessage,
          refs,
        };
      }
      return newMessages;
    });
  };

  const handleLanguageChange = async (chosenLanguage) => {
    setSelectedLanguage(chosenLanguage);
    const data = await makeApiRequest(
      "/translate-chat",
      "post",
      JSON.stringify({
        queries: originalQueries,
        responses: originalResponses,
        language: chosenLanguage,
      })
    );

    let userIndex = 0;
    let botIndex = 0;

    setMessages(
      messages.map((message, index) => {
        if (message.sender === "user") {
          const updatedMessage = {
            ...message,
            text: data.translated_queries[userIndex],
          };
          userIndex++;
          return updatedMessage;
        } else if (message.sender === "bot") {
          const botMessage = (
            <div key={index}>
              <div className="coorg-response">
                {data.translated_responses[botIndex]}
              </div>
              <AddOptionsModal
                text={data.translated_responses[botIndex]}
                addToNewNote={addToNewNote}
                refs={message?.refs}
                addToExistingNote={addToExistingNote}
                setExistingNote={setExistingNote}
                question={data.translated_queries[userIndex - 1]}
                existingNote={existingNote}
                onHide={onHide}
                isNewNote={isNewNote}
                setShowNoteModal={setShowNoteModal}
                updateSelectedNote={setSelectedNote}
                showNoteModal={showNoteModal}
                selectedNote={selectedNote}
                notes={notes}
              />
              {(message?.refs?.videoObjects.length > 0 ||
                message?.refs?.keyframeObjects.length > 0 ||
                message?.refs?.pdfObjects.length > 0 ||
                message?.refs?.imageObjects.length > 0) && (
                  <div>
                    {/* <p className="m-0">References:</p> */}
                    {
                      message?.refs?.videoObjects.map((video) => {
                        return (
                          <li key={video.source_path} className="ml-4 list-none" data-object={video}>
                            <Link onClick={(event) => handleVideoLinkClick(event, video)}>
                              {video.source_path + " | Timestamp: " + video.timestamp}
                            </Link>
                          </li>
                        );
                      })
                    }
                    {
                      message?.refs?.keyframeObjects.map((video) => {
                        return (
                          <li key={video.source_path} className="ml-4 list-none" data-object={video}>
                            <Link onClick={(event) => handleVideoLinkClick(event, video)}>
                              {video.source_path + " | keyframe at: " + decimalSecondsToHHMMSS(video.timestamp)}
                            </Link>
                          </li>
                        );
                      })}
                    {
                      message?.refs?.pdfObjects.map((pdf) => {
                        return (
                          <li key={pdf.source_path} className="ml-4 list-none" data-object={pdf}>
                            <Link onClick={(event) => handlePDFLinkClick(event, pdf)}>
                              {pdf.source_path + " | Page: " + (parseInt(pdf.page) + 1)}
                            </Link>
                          </li>
                        );
                      })
                    }
                    {
                      message?.refs?.imageObjects.map((img) => {
                        return (
                          <li key={img.source_path} className="ml-4 list-none" data-object={img}>
                            <Link onClick={(event) => handlePDFLinkClick(event, img)}>
                              {img.source_path}
                            </Link>
                          </li>
                        );
                      })}
                  </div>
                )}
            </div>
          );

          const updatedMessage = {
            ...message,
            text: botMessage,
            references: message.references,
          };
          botIndex++;
          return updatedMessage;
        } else {
          return message;
        }
      })
    );
  };

  const addToNewNote = async (textToAdd, file, question = '', models = selectedLLMs, refs) => {

    const newText = {
      id: generateRandomHash(5),
      model: models[0],
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
    setActiveView('note');
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
              videoObjects: [],
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


  const selectLLMModels = (event) => {
    event.preventDefault();
    setShowLLMModal(true);
  };

  const onHideLLMModal = () => {
    setShowLLMModal(false);
  };

  const handleRepeatQuestion = (message, models) => {
    // setInput(message);
    if (models[0] === 'gpt-4-vision') {
      handleVisionUpload(null, message);
      return;
    }

    if (models[0] === 'dall-e-3') {
      sendMessage(message, models);
      return;
    }

    if (models[0] !== 'dall-e-3' && models[0] !== 'gpt-4-vision') {
      sendMessage(message);
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

  return (
    <article className="relative flex flex-col flex-1 h-full overflow-y-auto">
      <section className="flex flex-wrap items-center justify-center gap-3">
        {
          notes.map((note, i) => {
            <p key={i}>{note.note_name}</p>;
          })
        }
        <div className="language-dropdown">
          <CustomSelectTwo
            options={languageOptions}
            onChange={(chosenLanguage) => handleLanguageChange(chosenLanguage.value)}
            placeholder="Select a language"
          />
        </div>

        <div className="models-list-button">
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
        />
      </section>

      <section className="flex items-center gap-1 mx-2 my-3 user-select-none">
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
          {selectedLLMs.length === 0 ? (
            <span
              className={`text-xs ${theme === "light" ? "text-textColor-300" : "text-textColor-200"
                }`}
            >
              none
            </span>
          ) : (
            selectedLLMs.map((model, index) => (
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
        {/* <BaseHeading text={`Selected models: ${selectedLLMs[0] || "None"}`} /> */}
      </section>

      {/* <div className="flex items-center flex-1 gap-3"> */}
      <section
        className={`copilot-chat-container flex flex-col flex-1 flex-grow h-full gap-3 py-3 overflow-y-auto ${theme === "light" ? "!border" : "!border !border-textColor-300"
          }`}
        ref={chatAppRef}
      >
        {chatLoaded ? (
          messages.map((message, index) =>
            index % 2 == 0 ? (
              <div key={index} className="my-2 break-all w-fit">
                <div
                  className={`message user-message h-full flex flex-col m-2 p-2  bg-primary-300 text-white rounded-md`}
                >
                  {
                    message.models.includes('gpt-4-vision')
                      ? (
                        <>
                          <div className="flex items-center justify-between">
                            <b className="user-select-none">You: </b>
                            <div
                              className="cursor-pointer"
                              onClick={() => {
                                handleVisionUpload(message.text.images, message.text.query);
                              }}
                            >
                              <ReplayOutlinedIcon />
                            </div>
                          </div>
                          <div>
                            {
                              message.text.imgs_list.map((img, index) => {
                                return (
                                  <img src={URL.createObjectURL(img)} key={img.name} alt='uploaded image' className='flex-1 mb-2 cursor-pointer' onClick={() => showImageInPreview(index)} />
                                );
                              })
                            }
                            <p className="break-words">{message.text.query}</p>
                            {/* <p>{message.text}</p> */}
                          </div>
                          {isLightboxOpen && (
                            <PreviewModal closeLightbox={closeLightbox} content={URL.createObjectURL(message.text.imgs_list[imagePreviewIndex])} />
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <b className="user-select-none">You: </b>
                            <div
                              className="cursor-pointer"
                              onClick={() => {
                                handleRepeatQuestion(message.text, message.models);
                              }}
                            >
                              <ReplayOutlinedIcon />
                            </div>
                          </div>
                          <div>{message.text.startsWith('blob') ? (<img src={message.text} alt='uploaded image' className='flex-1' />) : (<p className="m-0" dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br>') }}></p>)}</div>
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
                    {message.models.includes("dall-e-3") && message.img ? (
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
                            src={message.img}
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
                                text={message.img}
                                addToNewNote={addToNewNote}
                                addToExistingNote={addToExistingNote}
                                setExistingNote={setExistingNote}
                                question={message.question}
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
                              {message.models.map((item, index) => (
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
                            <PreviewModal closeLightbox={closeLightbox} content={message.img} />
                          )}
                          {/* <ImageModal
                              show={showImageModal}
                              onHide={onHideImageModal}
                              imageURL={message.img}
                              className="modal"
                              key={message.img}
                            /> */}
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
                          {message.text}
                        </div>
                        {showCursor && index == responseIndex ? (
                          <div className="inline-block w-1 h-5 bg-textColor-300 animate-blink"></div>
                        ) : null}

                        {/* add to note */}
                        {/* <AddOptionsModal
                            text={message.text}
                            file={message.file}
                            models={["gpt-4-vision"]}
                            addToNewNote={addToNewNote}
                            addToExistingNote={addToExistingNote} D
                            setExistingNote={setExistingNote}
                            question={message.question}
                            existingNote={existingNote}
                            onHide={onHide}
                            isNewNote={isNewNote}
                            setShowNoteModal={setShowNoteModal}
                            updateSelectedNote={setSelectedNote}
                            showNoteModal={showNoteModal}
                            selectedNote={selectedNote}
                            notes={notes}
                          /> */}


                        <div className="flex flex-wrap items-center gap-1">
                          <span
                            className={`text-xs ${theme === "light"
                              ? "text-textColor-300"
                              : "text-textColor-200"
                              }`}
                          >
                            Models:{" "}
                          </span>
                          {message.models.map((item, index) => (
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
                    )}
                  </div>
                </div>
              </div>
            )
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-full loading-container">
            <div className="chat-spinner">
              <LoadingSpinner />
            </div>
            <p className="text-sm text-center loading-text text-textColor-200">
              Loading Knowledgebase...
            </p>
          </div>
        )}
      </section>

      {/* </div> */}
      <section className="flex items-center gap-2 copilot-chat-container input-area">

        {
          selectedLLMs[0] === 'gpt-4-vision'
            ?
            // <CustomButton className='flex items-center justify-center w-3/4 mx-auto text-white bg-primary-300' onClick={() => imageGenRefInput.current.click()}>
            //   <div
            //     className={`p-2 rounded-md cursor-pointer ${theme === "light" ? "border" : "!border !border-textColor-300"
            //       }`}
            //   >
            //     <AttachFileOutlinedIcon color="white" />
            //     {/* render file input and hide it */}
            //     <input type='file' accept='.png,.jpg,.jpeg,.svg' ref={imageGenRefInput} name='image-generation' className='hidden' onChange={(e) => handleVisionUpload(e)} />
            //   </div>
            //   <p className="m-0">Upload an image</p>
            // </CustomButton>
            <ImageUpload handleUpload={handleVisionUpload} />
            :
            <>
              {/* <CustomInput
                placeholder="Message model..."
                value={input}
                disabled={showCursor}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage(input);
                  }
                }}
              /> */}
              <CustomTextArea
                placeholder="Message model..."
                value={input}
                rows="1"
                disabled={showCursor}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    sendMessage(input);
                  }
                }} />
              <div
                className={`p-2 rounded-md cursor-pointer z-[41] ${theme === "light" ? "border" : "!border !border-textColor-300"
                  }`}
                onClick={(e) => { sendMessage(input); e.target.value = e.target.value?.replace(/(\r\n|\n\r)/gm, ""); }}
              >
                <SendIcon color="primary" />
              </div>
            </>}

      </section>
    </article>
  );
};

export default CopilotSection;
