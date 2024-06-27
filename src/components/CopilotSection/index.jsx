import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import { escape, blacklist } from 'validator';
import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import makeApiRequest from "../../api";
import { MainContext } from "../../contexts/mainContext";
import AddOptionsModal from "../AddOptionsModal";
import CustomInput from "../CustomInput";
import CustomSelect from "../CustomSelect";
import { LLMModal } from "../LLMModal";
import LoadingSpinner from "../LoadingSpinner";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import CustomButton from "../CustomButton";
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import { hexToRGBString, toBase64 } from '../../utils';
import CustomSelectTwo from '../CustomSelectTwo';
import ImageUpload from '../ImageUpload';
import PreviewModal from '../PreviewModal';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
const CopilotSection = ({ chatLoaded, setChatLoaded }) => {
  const {
    theme,
    currentResource,
    llmModels,
    setCurrentResource,
    isFoundationLlm,
    resourceURL,
    noteReferences, setNoteReferences,
    setResourceURL,
    player,
    isPlayerReady,
    notes,
    setNotes,
    selectedNote,
    setSelectedNote,
    showNoteModal,
    setShowNoteModal,
    selectedSources,
    selectedAll,
    isNewNote,
    setIsNewNote,
    setSummary,
    setJumpToPage,
    languageOptions, setIsManualNote,
    setSummaries,
    setShowNoteDetails,
    setActiveView
  } = useContext(MainContext);


  const chatAppRef = useRef();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const [selectedLanguage, setSelectedLanguage] = useState("en"); // chat default language

  const [originalQueries, setOriginalQueries] = useState([]);
  const [originalResponses, setOriginalResponses] = useState([]);
  const [responseIndex, setResponseIndex] = useState(-1);
  const [selectedCategoryChat] = useState("all");
  const [fromChat, setFromChat] = useState(false);
  const [existingNote, setExistingNote] = useState(0);

  const existingNoteRef = useRef(existingNote);

  const [showCursor, setShowCursor] = useState(false);

  const [, setShowImageModal] = useState(false);

  // For GPT-4-Vision
  const [, setIsUploadingVisionImg] = useState(false);

  // For LLM Model Selction from the popup modal
  const [selectedLLMs, setSelectedLLMs] = useState([llmModels[0].value]); // State to track multiple selected LLMs
  const [showLLMModal, setShowLLMModal] = useState(false);

  const imageGenRefInput = useRef(null);

  // scroll chatAppRef to bottom whenever a new message is added to the chat
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

  function timeToSeconds(time) {
    const parts = time.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);

    return hours * 3600 + minutes * 60 + seconds;
  }

  useEffect(() => {
    if (
      fromChat &&
      isPlayerReady &&
      resourceURL &&
      currentResource.file_type === "video"
    ) {
      const timestamp = currentResource.timestamp; // Make sure you have the timestamp here
      if (timestamp) player.current.seekTo(timeToSeconds(timestamp));
      else;
      setFromChat(false);
    }
  }, [isPlayerReady]);

  let noteQuestion = useRef('');
  const sendMessage = async (message, models = selectedLLMs) => {
    if (!chatLoaded) return;

    if (message === "" && input === "") {
      return;
    }

    const validatedInput = blacklist(input, '<>/');
    setShowCursor(true);

    let userMessage = "";

    if (selectedLanguage != "en") {
      const data = await makeApiRequest(
        `/translate`,
        "post",
        JSON.stringify({ text: validatedInput || message, language: selectedLanguage })
      );
      userMessage = data.translatedText;
    } else userMessage = validatedInput || message;

    noteQuestion.current = userMessage;

    setOriginalQueries([...originalQueries, userMessage]);
    setMessages([
      ...messages,
      { sender: "user", text: userMessage, models, question: userMessage },
      { sender: "bot", text: "", models, question: userMessage },
    ]);
    setInput("");
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
        )}/${encodeURIComponent(userMessage)}/${encodeURIComponent(
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
  };

  const handleVideoLinkClick = (event, video) => {
    event.preventDefault();
    setFromChat(true);
    const resourceURL = `${API_ENDPOINT}/${video.file_type
      }/all/${encodeURIComponent(video.source_path)}`;
    setCurrentResource(video);
    setResourceURL(resourceURL);
    setSummary(video.summary);
    setSummaries(video.topic_summaries);
    setActiveView('resource');
    // setShowNoteDetails(false);
  };

  const handlePDFLinkClick = (event, pdf) => {
    event.preventDefault();
    const resourceURL = `${API_ENDPOINT}/${pdf.file_type
      }/all/${encodeURIComponent(pdf.source_path)}`;
    setCurrentResource(pdf);
    setResourceURL(resourceURL);
    setSummary(pdf.summary);
    setSummaries(pdf.topic_summaries);
    setActiveView('resource');
    setJumpToPage({ page: parseInt(pdf.page) + 1 });
    // setShowNoteDetails(false);
  };

  function handleEditorClick() {
    console.log('refs inside editor has been clicked!');
  }

  const fetchReferences = async (botMessage) => {
    const response = await axios.get(`${API_ENDPOINT}/references`);
    const data = response.data;
    noteReferences.videoLinks = [];
    noteReferences.pdfLinks = [];
    noteReferences.imageLinks = [];

    const videoLinks = data.video_references.map((video) => {
      noteReferences.videoLinks.push(video.source_path + " | Timestamp: " + video.timestamp);
      return (
        <li key={video.source_path} className="ml-0">
          <Link onClick={(event) => handleVideoLinkClick(event, video)}>
            {video.source_path + " | Timestamp: " + video.timestamp}
          </Link>
        </li>
      );
    });
    const pdfLinks = data.pdf_references.map((pdf) => {
      noteReferences.pdfLinks.push(pdf.source_path + " | Page: " + (parseInt(pdf.page) + 1));
      return (
        <li key={pdf.source_path} className="ml-0">
          <Link onClick={(event) => handlePDFLinkClick(event, pdf)}>
            {pdf.source_path + " | Page: " + (parseInt(pdf.page) + 1)}
          </Link>
        </li>
      );
    });

    const imgLinks = data.img_references.map((img) => {
      noteReferences.imageLinks.push(img.source_path);
      return (
        <li key={img.source_path} className="ml-0">
          <Link onClick={(event) => handlePDFLinkClick(event, img)}>
            {img.source_path}
          </Link>
        </li>
      );
    });
    // `<li><a href="${video}" target="_blank">${video}</a></li>`
    // const references = {
    //   videoLinks: data.video_references.map((video, index) => {
    //     return (
    //       `<span style="display:none;" data-id='${JSON.stringify(video)}'>${JSON.stringify(video).substring(0, 3)}</span>`
    //     );
    //   }),
    //   pdfLinks: data.pdf_references.map((pdf, index) => {
    //     return (
    //       `<li key='${index}'><a href="${pdf.source_path + " | Page: " + (parseInt(pdf.page) + 1)}" target="_blank">${pdf.source_path + " | Page: " + (parseInt(pdf.page) + 1)}</a></li>`
    //     );
    //   }),
    //   imageLinks: data.img_references.map((img, index) => {
    //     return (
    //       `<li key='${index}'><a href="${img.source_path}" target="_blank">${img.source_path}</a></li>`
    //     );
    //   }),
    // };
    const references = {
      videoLinks: data.video_references.map((video, index) => {
        return (
          `<li key='${index}'><a style='cursor: pointer;' href="${encodeURIComponent(JSON.stringify(video))}" target="${JSON.stringify(video)}">${video.source_path + " | Timestamp: " + video.timestamp}</a></li>`
        );
      }),
      pdfLinks: data.pdf_references.map((pdf, index) => {
        return (
          `<li key='${index}'><a href="${encodeURIComponent(JSON.stringify(pdf))}" target="_blank">${pdf.source_path + " | Page: " + (parseInt(pdf.page) + 1)}</a></li>`
        );
      }),
      imageLinks: data.img_references.map((img, index) => {
        return (
          `<li key='${index}'><a href="${img.source_path}" target="_blank">${img.source_path}</a></li>`
        );
      }),
    };

    // set note references to videosLinks, pdfLinks and imgLinks
    // setNoteReferences({
    //   videoLinks,
    //   pdfLinks,
    //   imgLinks,
    // });

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
          addToExistingNote={addToExistingNote}
          setExistingNote={setExistingNote}
          question={noteQuestion.current}
          existingNote={existingNote}
          onHide={onHide}
          isNewNote={isNewNote}
          setShowNoteModal={setShowNoteModal}
          updateSelectedNote={setSelectedNote}
          references={references}
          showNoteModal={showNoteModal}
          selectedNote={selectedNote}
          notes={notes}
        />
        {!isFoundationLlm && videoLinks && pdfLinks && (
          <div>
            <p className="m-0">References:</p>
            {videoLinks && (
              <ul className="pl-1 text-sm break-all truncate whitespace-normal">
                {videoLinks}
              </ul>
            )}
            {pdfLinks && (
              <ul className="pl-1 text-sm break-all truncate whitespace-normal">
                {pdfLinks}
              </ul>
            )}
            {imgLinks && (
              <ul className="pl-1 text-sm break-all truncate whitespace-normal">
                {imgLinks}
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
          references: {
            videoLinks: videoLinks,
            pdfLinks: pdfLinks,
            imgLinks: imgLinks,
          },
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
              {message.references.videoLinks &&
                message.references.pdfLinks &&
                message.references.imgLinks && (
                  <div>
                    <p className="m-0">References:</p>
                    {message.references.videoLinks && (
                      <ul className="pl-1 text-sm break-all truncate whitespace-normal">
                        {message.references.videoLinks}
                      </ul>
                    )}
                    {message.references.pdfLinks && (
                      <ul className="pl-1 text-sm break-all truncate whitespace-normal">
                        {message.references.pdfLinks}
                      </ul>
                    )}
                    {message.references.imgLinks && (
                      <ul className="pl-1 text-sm break-all truncate whitespace-normal">
                        {message.references.imgLinks}
                      </ul>
                    )}
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

  const addToNewNote = async (textToAdd, file, question = '', models = selectedLLMs, references) => {

    const canRenderNoteRefs = (references?.videoLinks.length > 0 || references?.pdfLinks.length > 0 || references?.imageLinks.length > 0);
    const llmColor = llmModels.find((llm) => llm.value === models[0])?.color;
    const fallbackColor = theme === 'light' ? '#333' : '#fff';

    let imgUrl;
    if (file) {
      imgUrl = await toBase64(file);
    }

    const newText = {
      content:
        `<span>

        <h2 style='font-size: 20px; font-weight: bold; font-style: italic;'>
          ${file ? `<img src='${imgUrl}' />` : question}
        </h2>

        <p>
          ${textToAdd.startsWith('https://oaidalleapiprodscus.blob') ? `<img src='${textToAdd}' width="1000" />` : textToAdd}
        </p>
        
        ${canRenderNoteRefs ?
          `<h3 onclick='alert("hello")' style='font-size: 20px; font-weight: bold; font-style: italic; margin-bottom: 0px;'>
              references:
            </h3>
            
            <ul style='list-style-type: none;'>
              ${references.videoLinks.join('')}
              ${references.pdfLinks.join('')}
              ${references.imageLinks.join('')}
            </ul>` : ''}
      </span>`,
      model: models[0],
      color: llmColor || fallbackColor,
      question,
      answer: textToAdd,
      references,
    };
    const newNote = {
      ...selectedNote,
      note_name: "",
      text: [{
        ...newText
      }]
    };
    setSelectedNote(newNote);
    setIsNewNote(true);
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

  const addToExistingNote = async (newTextContent, file, question = '', models = selectedLLMs, references) => {
    // setNoteReferences({
    //   videoLinks: [],
    //   pdfLinks: [],
    //   imageLinks: [],
    // });

    // const videoLinks = noteReferences.videoLinks.map((video) => {
    //   return (
    //     `<li><a href="${video}" target="_blank">${video}</a></li>`
    //   );
    // });
    // const pdfLinks = noteReferences.pdfLinks.map((pdf) => {
    //   return (
    //     `<li><a href="${pdf}" target="_blank">${pdf}</a></li>`
    //   );
    // });
    // const imageLinks = noteReferences.imageLinks.map((img) => {
    //   return (
    //     `<li><a href="${img}" target="_blank">${img}</a></li>`
    //   );
    // });

    const canRenderNoteRefs = (references?.videoLinks?.length > 0 || references?.pdfLinks?.length > 0 || references?.imageLinks?.length > 0);

    const llmColor = llmModels.find((llm) => llm.value === models[0])?.color;
    const fallbackColor = theme === 'light' ? '#333' : '#fff';

    let imgUrl;
    if (file) {
      imgUrl = await toBase64(file);
    }

    const newNoteTextEntry = {
      content:
        `<span style="margin-top: 0px; color: ${hexToRGBString(llmColor || fallbackColor)}">
          <br />
          
          <h2 style='font-size: 20px; font-weight: bold; font-style: italic;'>
            ${file ? `<img src='${imgUrl}' />` : question}
          </h2>
          
          <p>
            ${newTextContent.startsWith('https://oaidalleapiprodscus.blob') ? `<img src='${newTextContent}' width="1000" />` : newTextContent}
          </p>

          ${canRenderNoteRefs ?
          `<h3 style='font-size: 20px; font-weight: bold; font-style: italic; margin-bottom: 0px;'>
                references:
              </h3>
            
              <ul style='list-style-type: none;'>
                ${references.videoLinks.join('')}
                ${references.pdfLinks.join('')}
                ${references.imageLinks.join('')}
              </ul>` : ''}
        </span>`,
      model: models[0],
      color: llmColor || fallbackColor,
      question,
      answer: newTextContent,
      references,
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
            content: "", model: null, color: theme === 'light' ? "#333" : '#fff', question: '', references: {
              videoLinks: [],
              pdfLinks: [],
              imageLinks: [],
            }
          }],
          images: [],
          note_name: "",
        });
      });
    setIsNewNote(false);
  };

  const fetchBlobAndRecreateFile = async (blob) => {
    if (blob) {
      const response = await fetch(blob);
      const newBlob = await response.blob();
      const newFile = new File([newBlob], 'recreated-file.jpg', {
        type: newBlob.type,
        lastModified: Date.now(),
      });
      return newFile;
    }
  };

  const handleVisionUpload = async (images, query) => {
    console.log("hehe");
    if (!chatLoaded) return;
    console.log("from parent copilot");
    console.log(images);
    console.log(query);
    // setIsUploadingVisionImg(true);
    // const selectedVisionLLMs = ['gpt-4-vision'];

    // // Function to handle file selection and upload
    // const file = event === null ? await fetchBlobAndRecreateFile(blob) : event.target.files[0];
    // if (file) {
    //   const formData = new FormData();
    //   formData.append("image", file);
    //   setShowCursor(true);
    //TODO:change user message so that it store the images as well as the query
    const userMessage = {
      query,
      images
    };

    //   const userMessage = URL.createObjectURL(file);
    setOriginalQueries([...originalQueries, userMessage]);

    setMessages([
      ...messages,
      { sender: "user", text: userMessage, models: ['gpt-4-vision'] },
      { sender: "bot", text: "", models: ['gpt-4-vision'] },
    ]);
    //   setInput("");
    setResponseIndex((responseIndex) => responseIndex + 2);

    //   try {
    //     const response = await axios.post(
    //       `${API_ENDPOINT}/upload-and-caption`,
    //       formData,
    //       {
    //         headers: {
    //           "Content-Type": "multipart/form-data",
    //         },
    //       }
    //     );

    //     // Assuming the response contains the caption
    //     const caption = response?.data.caption;
    //     const botMessage = (
    //       <div>
    //          list of images as <div flex><img><img>...</div>
    //         <p>{caption}</p>
    //         <AddOptionsModal
    //           text={caption}
    //           file={file}
    //           models={["gpt-4-vision"]}
    //           addToNewNote={addToNewNote}
    //           addToExistingNote={addToExistingNote}
    //           setExistingNote={setExistingNote}
    //           question={noteQuestion.current}
    //           existingNote={existingNote}
    //           onHide={onHide}
    //           isNewNote={isNewNote}
    //           setShowNoteModal={setShowNoteModal}
    //           updateSelectedNote={setSelectedNote}
    //           showNoteModal={showNoteModal}
    //           selectedNote={selectedNote}
    //           notes={notes}
    //         />
    //       </div>
    //     );
    //     setMessages((prevMessages) => {
    //       const newMessages = [...prevMessages];
    //       if (newMessages.length > 0) {
    //         const lastMessageIndex = newMessages.length - 1;
    //         newMessages[lastMessageIndex] = {
    //           ...newMessages[lastMessageIndex],
    //           text: botMessage,
    //         };
    //       }
    //       return newMessages;
    //     });

    //     // Update your chat messages state here to include the new caption
    //     // setMessages([...messages, { sender: 'bot', text: caption }]);
    //     // setMessages([...messages, { sender: 'user', text: userMessage }, { sender: 'bot', text: '' }]);
    //   } catch (error) {
    //     console.error("Error uploading and captioning image:", error);
    //   }
    // }
    // setShowCursor(false);
    // setIsUploadingVisionImg(false);
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
    <div className="relative flex flex-col flex-1 h-full overflow-y-auto">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {
          notes.map((note, i) => {
            <p key={i}>{note.note_name}</p>;
          })
        }
        <CustomSelectTwo
          options={languageOptions}
          onChange={(chosenLanguage) => handleLanguageChange(chosenLanguage.value)}
          placeholder="Select a language"
        />

        <CustomButton
          className={`my-0 ${theme === "light"
            ? "bg-white !text-dark border border-textColor-100"
            : " !text-textColor-100 !border !border-textColor-300"
            }`}
          style={{ width: "100%" }}
          onClick={selectLLMModels}
        >
          Models
        </CustomButton>
        <LLMModal
          show={showLLMModal}
          onHide={onHideLLMModal}
          selectedLLMs={selectedLLMs}
          setSelectedLLMs={setSelectedLLMs}
          llmModels={llmModels}
          className="modal"
        />
      </div>

      <div className="flex items-center gap-1 mx-2 my-3 user-select-none">
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
      </div>

      <div
        className={`flex flex-col flex-1 flex-grow h-full gap-3 py-3 overflow-y-auto ${theme === "light" ? "!border" : "!border !border-textColor-300"
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
                              message.text.images.map((img, index) => {
                                return (
                                  <img src={img} key={img} alt='uploaded image' className='flex-1 mb-2 cursor-pointer' onClick={() => showImageInPreview(index)} />
                                );
                              })
                            }
                            <p>{message.text.query}</p>
                          </div>
                          {isLightboxOpen && (
                            <PreviewModal closeLightbox={closeLightbox} content={message.text.images[imagePreviewIndex]} />
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
                          <div>{message.text.startsWith('blob') ? (<img src={message.text} alt='uploaded image' className='flex-1' />) : (<p className="m-0">{message.text}</p>)}</div>
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
                      }`}
                  >
                    {message.models.includes("dall-e-3") && message.img ? (
                      <>
                        <b
                          className={`user-select-none ${theme === "light"
                            ? "text-textColor-300"
                            : "text-textColor-100"
                            }`}
                        >
                          Chatbot:{" "}
                        </b>
                        <div className="flex flex-col flex-1">
                          <img
                            src={message.img}
                            alt="Image is Loading ..."
                            onClick={openLightbox}
                            className="flex-1 cursor-pointer"
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
                          Chatbot:{" "}
                        </b>
                        <div
                          className={`${theme === "light"
                            ? "text-textColor-300"
                            : "text-textColor-100"
                            }`}
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
              Loading Knowledge Base, Please wait a few seconds...
            </p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 input-area">

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
              <CustomInput
                placeholder="Message model..."
                value={input}
                disabled={showCursor}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage(input);
                  }
                }}
              />
              <div
                className={`p-2 rounded-md cursor-pointer ${theme === "light" ? "border" : "!border !border-textColor-300"
                  }`}
                onClick={() => sendMessage(input)}
              >
                <SendIcon color="primary" />
              </div>
            </>}

      </div>
    </div>
  );
};

export default CopilotSection;
