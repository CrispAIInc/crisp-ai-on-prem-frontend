import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import makeApiRequest from "../../api";
import { MainContext } from "../../contexts/mainContext";
import AddOptionsModal from "../AddOptionsModal";
import CustomInput from "../CustomInput";
import CustomSelect from "../CustomSelect";
import ImageModal from "../ImageModal";
import { LLMModal } from "../LLMModal";
import LoadingSpinner from "../LoadingSpinner";
import { NoteModal } from "../NoteModal";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import CustomButton from "../CustomButton";
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import { hexToRGBString } from '../../utils';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
const CopilotSection = ({ chatLoaded, setChatLoaded }) => {
  const {
    theme,
    currentResource,
    setCurrentResource,
    resourceURL,
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
    setSummaries,
    setShowNoteDetails,
    setActiveView
  } = useContext(MainContext);


  const chatAppRef = useRef();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  // const [chatLoaded, setChatLoaded] = useState("");

  const [selectedLanguage, setSelectedLanguage] = useState("en"); // chat default language

  // const [coorgToLanguage, setCoorgToLanguage] = useState('afrikaans');
  // const [userToLanguage, setUserToLanguage] = useState('afrikaans');
  const [originalQueries, setOriginalQueries] = useState([]);
  const [originalResponses, setOriginalResponses] = useState([]);
  // const [isTranslatingUser, setIsTranslatingUser] = useState(false);
  // const [isTranslatingCoorg, setIsTranslatingCoorg] = useState(false);
  // const [clickedIndex, setClickedIndex] = useState(0);
  const [responseIndex, setResponseIndex] = useState(-1);
  // const [gptModel, setGptModel] = useState('gpt-4');
  const [selectedCategoryChat] = useState("all");
  const [fromChat, setFromChat] = useState(false);
  const [existingNote, setExistingNote] = useState(0);

  const existingNoteRef = useRef(existingNote);

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "af", label: "Afrikaans" },
    { value: "sq", label: "Albanian" },
    { value: "am", label: "Amharic" },
    { value: "ar", label: "Arabic" },
    { value: "hy", label: "Armenian" },
    { value: "as", label: "Assamese" },
    { value: "ay", label: "Aymara" },
    { value: "az", label: "Azerbaijani" },
    { value: "bm", label: "Bambara" },
    { value: "eu", label: "Basque" },
    { value: "be", label: "Belarusian" },
    { value: "bn", label: "Bengali" },
    { value: "bho", label: "Bhojpuri" },
    { value: "bs", label: "Bosnian" },
    { value: "bg", label: "Bulgarian" },
    { value: "ca", label: "Catalan" },
    { value: "ceb", label: "Cebuano" },
    { value: "ny", label: "Chichewa" },
    { value: "zh-CN", label: "Chinese (simplified)" },
    { value: "zh-TW", label: "Chinese (traditional)" },
    { value: "co", label: "Corsican" },
    { value: "hr", label: "Croatian" },
    { value: "cs", label: "Czech" },
    { value: "da", label: "Danish" },
    { value: "dv", label: "Dhivehi" },
    { value: "doi", label: "Dogri" },
    { value: "nl", label: "Dutch" },
    { value: "eo", label: "Esperanto" },
    { value: "et", label: "Estonian" },
    { value: "ee", label: "Ewe" },
    { value: "tl", label: "Filipino" },
    { value: "fi", label: "Finnish" },
    { value: "fr", label: "French" },
    { value: "fy", label: "Frisian" },
    { value: "gl", label: "Galician" },
    { value: "ka", label: "Georgian" },
    { value: "de", label: "German" },
    { value: "el", label: "Greek" },
    { value: "gn", label: "Guarani" },
    { value: "gu", label: "Gujarati" },
    { value: "ht", label: "Haitian Creole" },
    { value: "ha", label: "Hausa" },
    { value: "haw", label: "Hawaiian" },
    { value: "iw", label: "Hebrew" },
    { value: "hi", label: "Hindi" },
    { value: "hmn", label: "Hmong" },
    { value: "hu", label: "Hungarian" },
    { value: "is", label: "Icelandic" },
    { value: "ig", label: "Igbo" },
    { value: "ilo", label: "Ilocano" },
    { value: "id", label: "Indonesian" },
    { value: "ga", label: "Irish" },
    { value: "it", label: "Italian" },
    { value: "ja", label: "Japanese" },
    { value: "jw", label: "Javanese" },
    { value: "kn", label: "Kannada" },
    { value: "kk", label: "Kazakh" },
    { value: "km", label: "Khmer" },
    { value: "rw", label: "Kinyarwanda" },
    { value: "gom", label: "Konkani" },
    { value: "ko", label: "Korean" },
    { value: "kri", label: "Krio" },
    { value: "ku", label: "Kurdish (Kurmanji)" },
    { value: "ckb", label: "Kurdish (Sorani)" },
    { value: "ky", label: "Kyrgyz" },
    { value: "lo", label: "Lao" },
    { value: "la", label: "Latin" },
    { value: "lv", label: "Latvian" },
    { value: "ln", label: "Lingala" },
    { value: "lt", label: "Lithuanian" },
    { value: "lg", label: "Luganda" },
    { value: "lb", label: "Luxembourgish" },
    { value: "mk", label: "Macedonian" },
    { value: "mai", label: "Maithili" },
    { value: "mg", label: "Malagasy" },
    { value: "ms", label: "Malay" },
    { value: "ml", label: "Malayalam" },
    { value: "mt", label: "Maltese" },
    { value: "mi", label: "Maori" },
    { value: "mr", label: "Marathi" },
    { value: "mni-Mtei", label: "Meiteilon (Manipuri)" },
    { value: "lus", label: "Mizo" },
    { value: "mn", label: "Mongolian" },
    { value: "my", label: "Myanmar" },
    { value: "ne", label: "Nepali" },
    { value: "no", label: "Norwegian" },
    { value: "or", label: "Odia (Oriya)" },
    { value: "om", label: "Oromo" },
    { value: "ps", label: "Pashto" },
    { value: "fa", label: "Persian" },
    { value: "pl", label: "Polish" },
    { value: "pt", label: "Portuguese" },
    { value: "pa", label: "Punjabi" },
    { value: "qu", label: "Quechua" },
    { value: "ro", label: "Romanian" },
    { value: "ru", label: "Russian" },
    { value: "sm", label: "Samoan" },
    { value: "sa", label: "Sanskrit" },
    { value: "gd", label: "Scots Gaelic" },
    { value: "nso", label: "Sepedi" },
    { value: "sr", label: "Serbian" },
    { value: "st", label: "Sesotho" },
    { value: "sn", label: "Shona" },
    { value: "sd", label: "Sindhi" },
    { value: "si", label: "Sinhala" },
    { value: "sk", label: "Slovak" },
    { value: "sl", label: "Slovenian" },
    { value: "so", label: "Somali" },
    { value: "es", label: "Spanish" },
    { value: "su", label: "Sundanese" },
    { value: "sw", label: "Swahili" },
    { value: "sv", label: "Swedish" },
    { value: "tg", label: "Tajik" },
    { value: "ta", label: "Tamil" },
    { value: "tt", label: "Tatar" },
    { value: "te", label: "Telugu" },
    { value: "th", label: "Thai" },
    { value: "ti", label: "Tigrinya" },
    { value: "ts", label: "Tsonga" },
    { value: "tr", label: "Turkish" },
    { value: "tk", label: "Turkmen" },
    { value: "ak", label: "Twi" },
    { value: "uk", label: "Ukrainian" },
    { value: "ur", label: "Urdu" },
    { value: "ug", label: "Uyghur" },
    { value: "uz", label: "Uzbek" },
    { value: "vi", label: "Vietnamese" },
    { value: "cy", label: "Welsh" },
    { value: "xh", label: "Xhosa" },
    { value: "yi", label: "Yiddish" },
    { value: "yo", label: "Yoruba" },
    { value: "zu", label: "Zulu" },
  ];

  const [showCursor, setShowCursor] = useState(false);

  const llmModels = [
    { value: "gpt-4", label: "GPT-4", type: "llm", color: "#D163DA" },
    {
      value: "dall-e-3",
      label: "Dall-e-3",
      type: "image-generation",
      color: "#3F51B5",
    },
    {
      value: "gpt-4-vision",
      label: "GPT-4-Vision",
      type: "lvm",
      color: "#4527A0",
    },
    { value: "llama-2", label: "LLAMA-2", type: "llm", color: "#388E3C" },
    {
      value: "mistral-8x7b",
      label: "Mistral LLM",
      type: "llm",
      color: "#EF6C00",
    },
    {
      value: "claude-3-opus",
      label: "Claude-3 (Opus)",
      type: "llm",
      color: "#FBC02D",
    },
    {
      value: "claude-3-sonnet",
      label: "Claude-3 (Sonnet)",
      type: "llm",
      color: "#616161",
    },
    { value: "gemini", label: "Gemini", type: "llm", color: "#00796B" },
  ];

  const [showImageModal, setShowImageModal] = useState(false);

  // For GPT-4-Vision
  const [, setIsUploadingVisionImg] = useState(false);

  // For LLM Model Selction from the popup modal
  const [selectedLLMs, setSelectedLLMs] = useState([llmModels[0].value]); // State to track multiple selected LLMs
  const [showLLMModal, setShowLLMModal] = useState(false);

  const imageGenRefInput = useRef(null);

  // useEffect(() => {
  //   if (isNewNote) {
  //     setShowNoteModal(true);
  //   }
  // }, [selectedNote, isNewNote]);

  // scroll chatAppRef to bottom whenever a new message is added to the chat
  useEffect(() => {
    // chatAppRef.current?.scrollIntoView({ behavior: 'smooth' });
    chatAppRef.current.scrollTop = chatAppRef.current?.scrollHeight;
  }, [messages]);

  // useEffect(() => {
  //     console.log(selectedLLMs);
  // }, [selectedLLMs]);

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
      console.log("timestamp", timestamp);
      console.log("timestamp to seconds", timeToSeconds(timestamp));
      if (timestamp) player.current.seekTo(timeToSeconds(timestamp));
      else;
      setFromChat(false);
    }
  }, [isPlayerReady]);

  // useEffect(() => {
  //     setModelsUsed(selectedLLMs);
  // }, [selectedLLMs]);

  const sendMessage = async (message, models = selectedLLMs) => {
    if (message === "" && input === "") {
      return;
    }

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

    setOriginalQueries([...originalQueries, userMessage]);
    setMessages([
      ...messages,
      { sender: "user", text: userMessage, models },
      { sender: "bot", text: "", models },
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
      console.log(data.image_url);

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
    } else {
      let sessionID = null; // Variable to store the session ID

      const eventSource = new EventSource(
        `${API_ENDPOINT}/message/${encodeURIComponent(
          selectedCategoryChat
        )}/${encodeURIComponent(userMessage)}/${encodeURIComponent(
          selectedLLMs[0]
        )}`
      );

      eventSource.onmessage = function (event) {
        const data = JSON.parse(event.data);

        if (data.type === "SESSION_ID") {
          sessionID = data.session_id;
          console.log("Received session ID:", sessionID);
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
        console.log("EventSource closed.");
        setShowCursor(false);
        eventSource.close();

        if (eventSource.readyState === EventSource.CLOSED) {
          // Extract session ID from the eventSource's URL
          fetchReferences(botMessage); // Function to fetch references
          setOriginalResponses([...originalResponses, botMessage]);
          console.log("Connection was closed normally.");
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
    // console.log(video);
  };

  const handlePDFLinkClick = (event, pdf) => {
    event.preventDefault();
    console.log(pdf.source_path);
    const resourceURL = `${API_ENDPOINT}/${pdf.file_type
      }/all/${encodeURIComponent(pdf.source_path)}`;
    setCurrentResource(pdf);
    setResourceURL(resourceURL);
    setSummary(pdf.summary);
    setSummaries(pdf.topic_summaries);
    setActiveView('resource');
    // setShowNoteDetails(false);
  };

  const fetchReferences = async (botMessage) => {
    const response = await axios.get(`${API_ENDPOINT}/references`);
    const data = response.data;
    const videoLinks = data.video_references.map((video) => (
      <li key={video.source_path} className="ml-0">
        <Link onClick={(event) => handleVideoLinkClick(event, video)}>
          {video.source_path + " | Timestamp: " + video.timestamp}
        </Link>
      </li>
    ));
    const pdfLinks = data.pdf_references.map((pdf) => (
      <li key={pdf.source_path} className="ml-0">
        <Link onClick={(event) => handlePDFLinkClick(event, pdf)}>
          {pdf.source_path + " | Page: " + (parseInt(pdf.page) + 1)}
        </Link>
      </li>
    ));
    const imgLinks = data.img_references.map((img) => (
      <li key={img.source_path} className="ml-0">
        <Link onClick={(event) => handlePDFLinkClick(event, img)}>
          {img.source_path}
        </Link>
      </li>
    ));

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
          // notesOptions={notesOptions}
          existingNote={existingNote}
          onHide={onHide}
          isNewNote={isNewNote}
          setShowNoteModal={setShowNoteModal}
          updateSelectedNote={setSelectedNote}
          showNoteModal={showNoteModal}
          selectedNote={selectedNote}
          notes={notes}
        />
        {videoLinks && pdfLinks && (
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

  const addToNewNote = (textToAdd) => {
    const newText = {
      content: `<p style="color: ${hexToRGBString(llmModels.find((llm) => llm.value === selectedLLMs[0])?.color || "#000")}">${textToAdd}</p>`,
      model: selectedLLMs[0],
      color:
        llmModels.find((llm) => llm.value === selectedLLMs[0])?.color || "#000", // Default color
    };
    const newNote = { ...selectedNote, text: [newText] };
    setSelectedNote(newNote);
    setIsNewNote(true);
    setShowNoteDetails(true);
    setActiveView('note');
  };

  useEffect(() => {
    existingNoteRef.current = existingNote;
  }, [setExistingNote, existingNote]);

  const addToExistingNote = (newTextContent) => {
    const newNoteTextEntry = {
      content: `<p style="color: ${hexToRGBString(llmModels.find((llm) => llm.value === selectedLLMs[0])?.color || "#000")}">${newTextContent}</p>`,
      model: selectedLLMs[0],
      color:
        llmModels.find((llm) => llm.value === selectedLLMs[0])?.color || "#000", // Default color
    };

    // Assuming existingNoteRef.current points to the index of the note in the notes array
    const existingNoteIndex = parseInt(existingNoteRef.current);

    // Check if 'text' in the note is already an array and append the new text entry
    if (Array.isArray(notes[existingNoteIndex].text)) {
      notes[existingNoteIndex].text.push(newNoteTextEntry);
    } else {
      // If for some reason 'text' is not an array, initialize it with the new text entry
      notes[existingNoteIndex].text = [newNoteTextEntry];
    }

    console.log(newNoteTextEntry);
    console.log(notes[existingNoteIndex]);

    // Update the selectedNote with the updated note
    setSelectedNote(notes[existingNoteIndex]);
    setIsNewNote(false); // Since we are updating an existing note, it's not a new note
    setShowNoteDetails(true);
    setActiveView('note');
    // setShowNoteModal(true); // Show the modal with the updated note
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
          text: [{ content: "", model: null, color: theme === 'light' ? "#333" : '#fff' }],
          images: [],
          note_name: "",
        });
      });
    setIsNewNote(false);
  };

  const onHideImageModal = () => {
    setShowImageModal(false);
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

  const handleVisionUpload = async (event, blob) => {
    setIsUploadingVisionImg(true);
    const selectedVisionLLMs = ['gpt-4-vision'];

    // Function to handle file selection and upload
    const file = event === null ? await fetchBlobAndRecreateFile(blob) : event.target.files[0];
    console.log(file);
    if (file) {
      const formData = new FormData();
      formData.append("image", file);
      setShowCursor(true);
      const userMessage = URL.createObjectURL(file);
      console.log("url img: ", userMessage);
      setOriginalQueries([...originalQueries, userMessage]);
      setMessages([
        ...messages,
        { sender: "user", text: userMessage, models: selectedVisionLLMs },
        { sender: "bot", text: "", models: selectedVisionLLMs },
      ]);
      setInput("");
      setResponseIndex((responseIndex) => responseIndex + 2);

      try {
        const response = await axios.post(
          `${API_ENDPOINT}/upload-and-caption`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Assuming the response contains the caption
        const caption = response?.data.caption;
        console.log("response ==> ", response?.data);

        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          if (newMessages.length > 0) {
            const lastMessageIndex = newMessages.length - 1;
            newMessages[lastMessageIndex] = {
              ...newMessages[lastMessageIndex],
              text: caption,
            };
          }
          return newMessages;
        });

        // Update your chat messages state here to include the new caption
        // setMessages([...messages, { sender: 'bot', text: caption }]);
        // setMessages([...messages, { sender: 'user', text: userMessage }, { sender: 'bot', text: '' }]);
      } catch (error) {
        console.error("Error uploading and captioning image:", error);
      }
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

    if (selectedLLMs[0] !== 'dall-e-3' && selectedLLMs[0] !== 'gpt-4-vision') {
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

  return (
    <div className="relative flex flex-col flex-1 h-full overflow-y-auto">
      <NoteModal
        show={showNoteModal}
        onHide={onHide}
        note={selectedNote}
        setSelectedNote={setSelectedNote}
        className="modal"
        existingNote={existingNote}
        isNewNote={isNewNote}
        key={selectedNote.note_name}
      />
      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* <CustomSelect
                    title="Category"
                    defaultValue={selectedCategory}
                    options={categoryOptions.filter(category => category.value !== 'all')}
                    onChange={(e) => handleChatCategorySelectChange(e.value)}
                /> */}
        <CustomSelect
          title="Language"
          defaultValue={languageOptions[0]}
          options={languageOptions}
          onChange={(chosenLanguage) => handleLanguageChange(chosenLanguage)}
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
              <div key={index} className="my-2 w-fit">
                <div
                  className={`message user-message h-full flex flex-col m-2 p-2  bg-primary-300 text-white rounded-md`}
                >
                  <div className="flex items-center justify-between">
                    <b className="">You: </b>
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        handleRepeatQuestion(message.text, message.models);
                      }}
                    >
                      <ReplayOutlinedIcon />
                    </div>
                  </div>
                  {
                    message.text.startsWith('blob') ? <img src={message.text} alt='uploaded image' /> : <p className="m-0">{message.text}</p>
                  }
                </div>
              </div>
            ) : (
              <>
                <div key={index} className="">
                  <div className={`message bot-message h-full`}>
                    {/* <b className="text-textColor-200">Chatbot: </b> */}
                    <div
                      className={`flex flex-col h-full p-2 m-2 rounded-md ${theme === "light"
                        ? "bg-separator text-textColor-200"
                        : "bg-background_workspace"
                        }`}
                    >
                      {message.models.includes("dall-e-3") && message.img ? (
                        <>
                          <b
                            className={`${theme === "light"
                              ? "text-textColor-300"
                              : "text-textColor-100"
                              }`}
                          >
                            Chatbot:{" "}
                          </b>
                          <div>
                            <img
                              src={message.img}
                              alt="Image is Loading ..."
                              onClick={openLightbox}
                              className="cursor-pointer"
                            />
                            <div className="flex flex-wrap items-center gap-1 mt-3">
                              <span
                                className={`text-xs ${theme === "light"
                                  ? "text-textColor-300"
                                  : "text-textColor-200"
                                  }`}
                              >
                                Models: Dall-e-3
                              </span>
                            </div>
                            {isLightboxOpen && (
                              <div
                                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
                                onClick={closeLightbox} // Close on click outside or click on lightbox
                              >
                                <div className="relative"> {/* Wrap lightbox content */}
                                  <button
                                    className="absolute text-2xl text-primary-300 top-4 right-4"
                                    onClick={closeLightbox} // Close on button click
                                  >
                                    &times;
                                  </button>
                                  <img
                                    src={message.img}
                                    alt="Image is Loading ..."
                                    className="w-80 h-80 max-w-95% max-h-95% object-cover"
                                  />
                                </div>
                              </div>
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
                            {message.text}
                          </div>
                          {showCursor && index == responseIndex ? (
                            <div className="inline-block w-1 h-5 bg-textColor-300 animate-blink"></div>
                          ) : null}

                          {/* add to note */}
                          {selectedLLMs[0] === "gpt-4-vision" && <AddOptionsModal
                            text={message.text}
                            addToNewNote={addToNewNote}
                            addToExistingNote={addToExistingNote}
                            setExistingNote={setExistingNote}
                            // notesOptions={notesOptions}
                            existingNote={existingNote}
                            onHide={onHide}
                            isNewNote={isNewNote}
                            setShowNoteModal={setShowNoteModal}
                            updateSelectedNote={setSelectedNote}
                            showNoteModal={showNoteModal}
                            selectedNote={selectedNote}
                            notes={notes}
                          />}


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
              </>
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
            <CustomButton className='flex items-center justify-center w-3/4 mx-auto text-white bg-primary-300' onClick={() => imageGenRefInput.current.click()}>
              {/* <div
                className={`p-2 rounded-md cursor-pointer ${theme === "light" ? "border" : "!border !border-textColor-300"
                  }`}
              > */}
              <AttachFileOutlinedIcon color="white" />
              {/* render file input and hide it */}
              <input type='file' accept='.png,.jpg,.jpeg,.svg' ref={imageGenRefInput} name='image-generation' className='hidden' onChange={(e) => handleVisionUpload(e)} />
              {/* </div> */}
              <p className="m-0">Upload an image</p>
            </CustomButton>
            :
            <>
              <CustomInput
                placeholder="Message model..."
                value={input}
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


        {/* </div>} */}

      </div>
    </div>
  );
};

export default CopilotSection;
