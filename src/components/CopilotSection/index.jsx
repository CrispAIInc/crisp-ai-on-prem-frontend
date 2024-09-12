import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import makeApiRequest from "../../api";
import { MainContext } from "../../contexts/mainContext";
import { decimalSecondsToHHMMSS, generateRandomHash, hexToRGBString, timeToSeconds, toBase64 } from '../../utils';
import AddOptionsModal from "../AddOptionsModal";
import CustomButton from "../CustomButton";
import CustomSelectTwo from '../CustomSelectTwo';
import CustomTextArea from '../CustomTextArea';
import ImageUpload from '../ImageUpload';
import { LLMModal } from "../LLMModal";
import LoadingSpinner from "../LoadingSpinner";
import PreviewModal from '../PreviewModal';
// import parse, { domToReact } from 'html-react-parser';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
const CopilotSection = ({ chatLoaded, setChatLoaded }) => {
  const {
    theme,
    currentResource,
    llmModels,
    setCurrentResource,
    fromChat, setFromChat,
    isFoundationLlm,
    resourceURL,

    noteReferences,
    setResourceURL,
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

  const [existingNote, setExistingNote] = useState(0);

  const existingNoteRef = useRef(existingNote);

  const [showCursor, setShowCursor] = useState(false);

  // For GPT-4-Vision
  const [, setIsUploadingVisionImg] = useState(false);

  // For LLM Model Selction from the popup modal
  const [selectedLLMs, setSelectedLLMs] = useState([llmModels[0].value]); // State to track multiple selected LLMs
  const [showLLMModal, setShowLLMModal] = useState(false);

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

  useEffect(() => {
    if (
      fromChat &&
      isPlayerReady &&
      resourceURL &&
      currentResource.file_type === "video"
    ) {
      const timestamp = currentResource?.timestamp; // Make sure you have the timestamp here
      if (timestamp) player.current.seekTo(typeof timestamp === "number" ? timestamp : timeToSeconds(timestamp));
      else;
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

    // const preDefinedQnA = {
    //   "what was Mark Leruste's standing with his degree": {
    //     answer: "Mark Leruste graduated with Upped Second Class Honours.",
    //     references: {
    //       timestamp: "0:21",
    //       videoRefs: [{
    //         "timestamp": "00:00:21",
    //         "category": [
    //           "all",
    //           "generic"
    //         ],
    //         "file_type": "video",
    //         "is_selected": false,
    //         "keywords": "Marker roost, English, French, University of Kent, business, European management, Spanish, F-A-Pres group, advertising agency, World Rene, newspapers, online tailoring service, NCAT, business school, communicator, relationships, creative solutions, English, French, Spanish, creative agency, social transformation, CV, website",
    //         "source_path": "videoplayback.mp4",
    //         "summary": "The video introduces Marker Roost, detailing his multicultural background, education, and professional journey. Roost, of English and French descent, was raised in France and is an alumnus of the University of Kent, holding a degree in business and European management with a specialization in Spanish. His career commenced at the F-A-Pres group, a media and advertising agency, allowing him to work internationally across five continents and contribute reports to prestigious global newspapers. Following this, Roost ventured into entrepreneurship by founding Servicetator, an online tailoring service for men, through which he amassed significant experience. His career trajectory then led him to NCAT, a premier business school, where he took on roles managing programs and offering advice to global leaders. Beyond his professional life, Roost is passionate about enjoying sunsets, indulging in long walks on the beach, and maintaining his fitness through regular workouts.\n\nRoost positions himself as a highly skilled communicator and problem-solver, proficient in English, French, and Spanish. He has been involved in numerous exciting projects and is driven by a desire to effectuate positive social change. Roost is keen on leveraging his skills and experiences by joining a creative agency committed to fostering social transformation. He encourages further engagement through his CV or website for a deeper insight into his professional ethos and accomplishments.",
    //         "thumbnail": "videoplayback.mp4.jpg",
    //         "topic_summaries": "The text introduces Marker Roost, who is of English and French descent and was raised in France. Roost graduated from the University of Kent with a degree in business and European management Spanish. Shortly after, he joined the F-A-Pres group, a media and advertising agency, and worked across five continents. His reports were published in renowned world newspapers. He later founded an online tailoring service for men named Servicetator and gained significant experience. Eventually, Roost joined NCAT, a leading business school, where he managed programs and advised global leaders. Besides his professional achievements, he enjoys sunsets, long walks on the beach, and working out.\n\n\"\"\n\nThe individual presents themselves as a strong communicator and problem-solver, fluent in English, French, and Spanish, with a history of involvement in exciting projects. They express a desire to make a real and positive impact from day one and are interested in joining a creative agency to foster social transformation. They invite further contact through their CV or website for more information on their professional style and achievements.\n\n",
    //         "transcript": "Speaker 1:  That's me  Marker roost, half English, half French, born and raised in fond of France.   But who cares, right? Well, give me a minute of your time, and I'll try and convince you what you should  I graduated from the University of Kent to the UK with a degree in business and European management Spanish.   Three days later, I joined F-A-Pres group, a median advertising agency, where worked across five continents, interviewing the Movers and Shakers of the World, and saw my country reports published in World Rene and newspapers  I then decided to start at my own company providing an online tailoring service for men, the servicetator was born  judging as it was, I learned to hell up a lot.   I eventually joined NCAT, a leading business school managing programs and advising global leaders  but enough for the boring stuff  You probably ask yourself, what are a few of my favorite things? Well, apart from some sets and long walks in the beach, I also happen to enjoy working out  Oh, no  Next Marshall on\nSpeaker 2:  you  you\nSpeaker 1:  Go, F*** Okay Thank you, Tau you Acting The time we feed and blogging Traveling and socialize  So why should you pick me out of seven billion people living on this planet? Well, as a strong communicator and a go-shitter, who can build effective relationships, I specialize in finding creative and innovative solutions to the toughest problems.   I also happen to speak English, French and Spanish, and have been involved in some very exciting stuff for the last few years.   This might sound a little missworld, but I truly believe that I can bring a real and positive impact to your organization from day one I'd love to join a creative agency y ydym yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn y to foster social transformation If you'd like to find out more, get in touch, down on my CV, or simply love out my pro riding style, check out my website Thank you.  . "
    //       }]
    //     }
    //   },
    //   "What is Mark Leruste's contact info": {
    //     answer: "Mark Leruste contact is as follows: Website: markleruste.com | LinkedIn: Mark Leruste | Facebook: Mark Leruste | X: @markleruste",
    //     references: {
    //       timestamp: "2:10",
    //       videoRefs: [{
    //         "timestamp": "00:02:10",
    //         "category": [
    //           "all",
    //           "generic"
    //         ],
    //         "file_type": "video",
    //         "is_selected": false,
    //         "keywords": "Marker roost, English, French, University of Kent, business, European management, Spanish, F-A-Pres group, advertising agency, World Rene, newspapers, online tailoring service, NCAT, business school, communicator, relationships, creative solutions, English, French, Spanish, creative agency, social transformation, CV, website",
    //         "source_path": "videoplayback.mp4",
    //         "summary": "The video introduces Marker Roost, detailing his multicultural background, education, and professional journey. Roost, of English and French descent, was raised in France and is an alumnus of the University of Kent, holding a degree in business and European management with a specialization in Spanish. His career commenced at the F-A-Pres group, a media and advertising agency, allowing him to work internationally across five continents and contribute reports to prestigious global newspapers. Following this, Roost ventured into entrepreneurship by founding Servicetator, an online tailoring service for men, through which he amassed significant experience. His career trajectory then led him to NCAT, a premier business school, where he took on roles managing programs and offering advice to global leaders. Beyond his professional life, Roost is passionate about enjoying sunsets, indulging in long walks on the beach, and maintaining his fitness through regular workouts.\n\nRoost positions himself as a highly skilled communicator and problem-solver, proficient in English, French, and Spanish. He has been involved in numerous exciting projects and is driven by a desire to effectuate positive social change. Roost is keen on leveraging his skills and experiences by joining a creative agency committed to fostering social transformation. He encourages further engagement through his CV or website for a deeper insight into his professional ethos and accomplishments.",
    //         "thumbnail": "videoplayback.mp4.jpg",
    //         "topic_summaries": "The text introduces Marker Roost, who is of English and French descent and was raised in France. Roost graduated from the University of Kent with a degree in business and European management Spanish. Shortly after, he joined the F-A-Pres group, a media and advertising agency, and worked across five continents. His reports were published in renowned world newspapers. He later founded an online tailoring service for men named Servicetator and gained significant experience. Eventually, Roost joined NCAT, a leading business school, where he managed programs and advised global leaders. Besides his professional achievements, he enjoys sunsets, long walks on the beach, and working out.\n\n\"\"\n\nThe individual presents themselves as a strong communicator and problem-solver, fluent in English, French, and Spanish, with a history of involvement in exciting projects. They express a desire to make a real and positive impact from day one and are interested in joining a creative agency to foster social transformation. They invite further contact through their CV or website for more information on their professional style and achievements.\n\n",
    //         "transcript": "Speaker 1:  That's me  Marker roost, half English, half French, born and raised in fond of France.   But who cares, right? Well, give me a minute of your time, and I'll try and convince you what you should  I graduated from the University of Kent to the UK with a degree in business and European management Spanish.   Three days later, I joined F-A-Pres group, a median advertising agency, where worked across five continents, interviewing the Movers and Shakers of the World, and saw my country reports published in World Rene and newspapers  I then decided to start at my own company providing an online tailoring service for men, the servicetator was born  judging as it was, I learned to hell up a lot.   I eventually joined NCAT, a leading business school managing programs and advising global leaders  but enough for the boring stuff  You probably ask yourself, what are a few of my favorite things? Well, apart from some sets and long walks in the beach, I also happen to enjoy working out  Oh, no  Next Marshall on\nSpeaker 2:  you  you\nSpeaker 1:  Go, F*** Okay Thank you, Tau you Acting The time we feed and blogging Traveling and socialize  So why should you pick me out of seven billion people living on this planet? Well, as a strong communicator and a go-shitter, who can build effective relationships, I specialize in finding creative and innovative solutions to the toughest problems.   I also happen to speak English, French and Spanish, and have been involved in some very exciting stuff for the last few years.   This might sound a little missworld, but I truly believe that I can bring a real and positive impact to your organization from day one I'd love to join a creative agency y ydym yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn ymthodd yn y to foster social transformation If you'd like to find out more, get in touch, down on my CV, or simply love out my pro riding style, check out my website Thank you.  . "
    //       }]
    //     }
    //   },
    //   "Give me footage of cultural celebration in the Andean region": {
    //     answer: "The scene shifts to a vibrant cultural celebration, where three individuals in colorful traditional attire dance energetically. Their red dresses and intricate patterns create a dynamic visual, while the stone structure and grassy ground in the background suggest a setting rich in cultural heritage.",
    //     references: {
    //       timestamp: "0:27",
    //       videoRefs: [{
    //         "timestamp": "00:00:27",
    //         "category": [
    //           "all",
    //           "generic"
    //         ],
    //         "file_type": "video",
    //         "is_selected": false,
    //         "keywords": ", , , Thank you, Ik kouw ze niet, Salut, mama, , ,  ,  , Capas, voy a pasar, que sí, no se acabe, pateroito, Just keep your eyes open, Yeah, see you soon, Oh my god, it's still empty, I'm actually doing it right",
    //         "source_path": "Sacred_Valley___PERU.mp4",
    //         "summary": "The video discusses the importance of progress and consensus, emphasizing the value of moving forward and the hope that certain positive conditions persist. It underscores the necessity of vigilance, advising viewers to remain observant to sustain desired outcomes. Additionally, it highlights a sense of surprise and satisfaction regarding the maintenance of an empty state, suggesting that achieving and preserving this state is a significant achievement. The content revolves around themes of advancement, agreement, hopefulness, and the strategic importance of awareness in achieving and maintaining successful states or outcomes.",
    //         "thumbnail": "Sacred_Valley___PERU.mp4.jpg",
    //         "topic_summaries": "\"\"\n\n\"\"\n\n\"\"\n\n\"\"\n\n\n\n\"\"\n\n\"\"\n\n\"\"\n\n\"\"\n\nThe text conveys a message about moving forward, agreeing with something, hoping something doesn't end, and advises to keep one's eyes open.\n\n\"\"\n\nThe speaker expresses surprise and satisfaction that something remains empty, indicating they are successfully achieving a desired outcome.\n\n",
    //         "transcript": "Speaker 1:  .     \nSpeaker 2:  Thank you    \nSpeaker 3:  you\nSpeaker 2:  you\nSpeaker 3:  you\nSpeaker 2:  you\nSpeaker 3:  That's your way  Ik kouw ze niet\nSpeaker 4:  Salut pas qu'il y a un mama\nSpeaker 5:   -.    .       Capas. \n\n   voy a pasar.   que sí.   no se acabe un pateroito  Just keep your eyes open\nSpeaker 3:  you  Yeah.   see you soon\nSpeaker 4:  Oh my god.   it's still.   it's still empty.  I'm actually doing it right. .  . "
    //       }]
    //     }
    //   },
    //   "Give me footage of small town life in the Andean region": {
    //     answer: `A person in dark clothing walks down a narrow street in a traditional village, the rustic buildings and natural light creating a nostalgic atmosphere. The silhouette of mountains in the background adds to the scenic beauty.

    //     An aerial view of a village with red-tiled roofs against a backdrop of majestic mountains is shown. The early morning or late afternoon light casts shadows, enhancing the dramatic landscape. The scene highlights the serene and grand setting of the Andean village.

    //     The video captures a flock of sheep being herded through a village street, with rustic buildings and natural light suggesting a daily life scene rich in tradition and community.

    //     A quiet street scene in the early morning or late evening shows a woman in traditional clothing walking alone. The peaceful atmosphere and blend of modern and traditional structures reflect the timeless charm of the village.

    //     A woman in traditional clothing prepares food in a rustic kitchen with stone walls. The scene captures the essence of Andean culinary traditions, emphasizing the cultural and communal aspects of food preparation`,
    //     references: {
    //       timestamp: "1:46",
    //       videoRefs: [{
    //         "timestamp": "00:01:46",
    //         "category": [
    //           "all",
    //           "generic"
    //         ],
    //         "file_type": "video",
    //         "is_selected": false,
    //         "keywords": ", , , Thank you, Ik kouw ze niet, Salut, mama, , ,  ,  , Capas, voy a pasar, que sí, no se acabe, pateroito, Just keep your eyes open, Yeah, see you soon, Oh my god, it's still empty, I'm actually doing it right",
    //         "source_path": "Sacred_Valley___PERU.mp4",
    //         "summary": "The video discusses the importance of progress and consensus, emphasizing the value of moving forward and the hope that certain positive conditions persist. It underscores the necessity of vigilance, advising viewers to remain observant to sustain desired outcomes. Additionally, it highlights a sense of surprise and satisfaction regarding the maintenance of an empty state, suggesting that achieving and preserving this state is a significant achievement. The content revolves around themes of advancement, agreement, hopefulness, and the strategic importance of awareness in achieving and maintaining successful states or outcomes.",
    //         "thumbnail": "Sacred_Valley___PERU.mp4.jpg",
    //         "topic_summaries": "\"\"\n\n\"\"\n\n\"\"\n\n\"\"\n\n\n\n\"\"\n\n\"\"\n\n\"\"\n\n\"\"\n\nThe text conveys a message about moving forward, agreeing with something, hoping something doesn't end, and advises to keep one's eyes open.\n\n\"\"\n\nThe speaker expresses surprise and satisfaction that something remains empty, indicating they are successfully achieving a desired outcome.\n\n",
    //         "transcript": "Speaker 1:  .     \nSpeaker 2:  Thank you    \nSpeaker 3:  you\nSpeaker 2:  you\nSpeaker 3:  you\nSpeaker 2:  you\nSpeaker 3:  That's your way  Ik kouw ze niet\nSpeaker 4:  Salut pas qu'il y a un mama\nSpeaker 5:   -.    .       Capas. \n\n   voy a pasar.   que sí.   no se acabe un pateroito  Just keep your eyes open\nSpeaker 3:  you  Yeah.   see you soon\nSpeaker 4:  Oh my god.   it's still.   it's still empty.  I'm actually doing it right. .  . "
    //       }]
    //     }
    //   },
    // };

    // // combined summary
    // if (Object.keys(preDefinedQnA).includes(userMessage)) {
    //   setTimeout(() => {
    //     setMessages((prevMessages) => {
    //       const newMessages = [...prevMessages];
    //       if (newMessages.length > 0) {
    //         const lastMessageIndex = newMessages.length - 1;
    //         newMessages[lastMessageIndex] = {
    //           ...newMessages[lastMessageIndex],
    //           text: preDefinedQnA[userMessage]?.answer
    //         };
    //       }
    //       return newMessages;
    //     });
    //     // hard fetching refs
    //     let refs = {
    //       videoLinks: [],
    //       pdfLinks: [],
    //       imgLinks: [],
    //     };

    //     const videoLinks = preDefinedQnA[userMessage]?.references.videoRefs.map((video) => {
    //       noteReferences.videoLinks.push(video.source_path + " | Timestamp: " + video.timestamp);
    //       refs["videoLinks"].push(video);
    //       return (
    //         <li key={video.source_path} className="ml-0">
    //           <Link onClick={(event) => handleVideoLinkClick(event, video)}>
    //             {video.source_path + " | Timestamp: " + video.timestamp}
    //           </Link>
    //         </li>
    //       );
    //     });
    //     const references = {
    //       videoLinks: preDefinedQnA[userMessage]?.references.videoRefs.map((video, index) => {
    //         return (
    //           `<li style='cursor: pointer; font-size: 12px;' key='${index}' data-object='${video}' onClick='${e => handleVideoLinkClick(e, video)}'>${video.source_path + " | Timestamp: " + video.timestamp}</li>`
    //         );
    //       }),
    //     };
    //     botMessage = (
    //       <div>
    //         <div className="coorg-response">
    //           {preDefinedQnA[userMessage]?.answer}
    //         </div>
    //         <AddOptionsModal
    //           text={
    //             preDefinedQnA[userMessage]?.answer
    //           }
    //           addToNewNote={addToNewNote}
    //           refs={refs}
    //           addToExistingNote={addToExistingNote}
    //           setExistingNote={setExistingNote}
    //           question={noteQuestion.current}
    //           existingNote={existingNote}
    //           onHide={onHide}
    //           isNewNote={isNewNote}
    //           setShowNoteModal={setShowNoteModal}
    //           updateSelectedNote={setSelectedNote}
    //           references={references}
    //           showNoteModal={showNoteModal}
    //           selectedNote={selectedNote}
    //           notes={notes}
    //         />
    //         {videoLinks && (
    //           <div>
    //             <p className="m-0">References:</p>
    //             {videoLinks && (
    //               <ul className="pl-1 text-sm break-all truncate whitespace-normal">
    //                 {videoLinks}
    //               </ul>
    //             )}
    //           </div>
    //         )}
    //       </div>
    //     );

    //     // Update the messages with the references
    //     setMessages((prevMessages) => {
    //       const newMessages = [...prevMessages];
    //       if (newMessages.length > 0) {
    //         const lastMessageIndex = newMessages.length - 1;
    //         newMessages[lastMessageIndex] = {
    //           ...newMessages[lastMessageIndex],
    //           text: botMessage,
    //           references: {
    //             videoLinks: videoLinks,
    //           },
    //         };
    //       }
    //       return newMessages;
    //     });
    //     setOriginalResponses([...originalResponses, botMessage]);
    //     setShowCursor(false);
    //   }, 3000);
    // }
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

  const handleVideoLinkClick = (event, video) => {
    event.preventDefault();
    setFromChat(true);
    const resourceURL = `${API_ENDPOINT}/${video.file_type
      }/all/${encodeURIComponent(video.source_path)}`;
    setCurrentResource({ ...video });
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
    setCurrentResource({ ...pdf });
    setResourceURL(resourceURL);
    setSummary(pdf.summary);
    setSummaries(pdf.topic_summaries);
    setActiveView('resource');
    setJumpToPage({ page: parseInt(pdf.page) + 1 });
    // setShowNoteDetails(false);
  };

  const fetchReferences = async (botMessage) => {
    const response = await axios.get(`${API_ENDPOINT}/references`);
    const data = response.data;// HERE
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
        <li key={video.source_path} className="ml-0">
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
        <li key={video.source_path} className="ml-0">
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
        <li key={pdf.source_path} className="ml-0">
          <Link onClick={(event) => handlePDFLinkClick(event, pdf)}>
            {pdf.source_path + " | Page: " + (parseInt(pdf.page) + 1)}
          </Link>
        </li>
      );
    });

    const imgLinks = data.img_references.map((img) => {
      noteReferences.imageLinks.push(img.source_path);
      refs["imageObjects"].push(img);
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
    // };keyframeLinks

    const references = {
      videoLinks: data.video_references.map((video, index) => {
        return (
          `<li style='cursor: pointer; font-size: 12px;' key='${index}' data-object='${video}' onClick='${e => handleVideoLinkClick(e, video)}'>${video.source_path + " | Timestamps: " + video.timestamp}</li>`
        );
      }),
      keyframeLinks: data.keyframe_references.map((video, index) => {
        return (
          `<li style='cursor: pointer; font-size: 12px;' key='${index}' data-object='${video}' onClick='${e => handleVideoLinkClick(e, video)}'>${video.source_path + " | Keyframe at: " + decimalSecondsToHHMMSS(video.timestamp)}</li>`
        );
      }),
      pdfLinks: data.pdf_references.map((pdf, index) => {
        return (
          `<li style='cursor: pointer; font-size: 12px;' key='${index}' data-object='${pdf}'>${pdf.source_path + " | Page: " + (parseInt(pdf.page) + 1)}</li>`
        );
      }),
      imageLinks: data.img_references.map((img, index) => {
        return (
          `<li style='cursor: pointer; font-size: 12px;' key='${index}' data-object='${img}'>${img.source_path}</li>`
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
          refs={refs}
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
            keyframeLinks: keyframeLinks,
            pdfLinks: pdfLinks,
            imgLinks: imgLinks,
          },
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
              {message?.references?.videoLinks &&
                message?.references?.keyframeLinks &&
                message?.references?.pdfLinks &&
                message?.references?.imgLinks && (
                  <div>
                    {/* <p className="m-0">References:</p> */}
                    {message.references.videoLinks && (
                      <ul className="pl-1 text-sm break-all truncate whitespace-normal">
                        {message.references.videoLinks}
                      </ul>
                    )}
                    {message.references.keyframeLinks && (
                      <ul className="pl-1 text-sm break-all truncate whitespace-normal">
                        {message.references.keyframeLinks}
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

  const addToNewNote = async (textToAdd, file, question = '', models = selectedLLMs, references, refs) => {

    const canRenderNoteRefs = (references?.videoLinks.length > 0 || references?.keyframeLinks.length > 0 || references?.pdfLinks.length > 0 || references?.imageLinks.length > 0);
    const llmColor = llmModels.find((llm) => llm.value === models[0])?.color;
    const fallbackColor = theme === 'light' ? '#333' : '#fff';

    let imgUrl;
    if (file) {
      imgUrl = await toBase64(file);
    }

    const newText = {
      id: generateRandomHash(5),
      content:
        `<span>

        <h2 style='font-size: 20px; font-weight: bold; font-style: italic;'>
          ${file ? `<img src='${imgUrl}' />` : question}
        </h2>

        <p>
          ${textToAdd.startsWith('https://oaidalleapiprodscus.blob') ? `<img src='${textToAdd}' width="1000" />` : textToAdd}
        </p>
        
        ${canRenderNoteRefs ?
          `<h3 style='font-size: 20px; font-weight: bold; font-style: italic; margin-bottom: 0px;'>
              references:
            </h3>
            
            <ul style='list-style-type: none;'>
              ${references?.videoLinks?.join('')}
              ${references?.keyframeLinks?.join('')}
              ${references?.pdfLinks?.join('')}
              ${references?.imageLinks?.join('')}
            </ul>` : ''}
      </span>`,
      model: models[0],
      color: llmColor || fallbackColor,
      question,
      answer: textToAdd,
      references,
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

  const addToExistingNote = async (newTextContent, file, question = '', models = selectedLLMs, references, refs) => {
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

    const canRenderNoteRefs = (references?.videoLinks?.length > 0 || references?.keyframeLinks?.length > 0 || references?.pdfLinks?.length > 0 || references?.imageLinks?.length > 0);

    const llmColor = llmModels.find((llm) => llm.value === models[0])?.color;
    const fallbackColor = theme === 'light' ? '#333' : '#fff';

    let imgUrl;
    if (file) {
      imgUrl = await toBase64(file);
    }

    const newNoteTextEntry = {
      id: generateRandomHash(5),
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
                ${references?.videoLinks?.join('')}
                ${references?.keyframeLinks?.join('')}
                ${references?.pdfLinks?.join('')}
                ${references?.imageLinks?.join('')}
              </ul>` : ''}
        </span>`,
      model: models[0],
      color: llmColor || fallbackColor,
      question,
      answer: newTextContent,
      references,
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
            content: "", model: null, color: theme === 'light' ? "#333" : '#fff', question: '', references: {
              videoLinks: [],
              keyframeLinks: [],
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

      {/* <div className="flex items-center flex-1 gap-3"> */}
      <div
        className={`flex flex-col flex-1 flex-grow h-full gap-3 py-3 overflow-y-auto ${theme === "light" ? "!border" : "!border !border-textColor-300"
          }`}
        ref={chatAppRef}
      >
        {chatLoaded ? (
          messages.map((message, index) =>
            index % 2 == 0 ? (
              <div key={index} className="my-2 break-all w-fit min-w-[50%]">
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
                          Crisp Wiz:{" "}
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
              Loading Knowledge Base, Please wait a few seconds...
            </p>
          </div>
        )}
      </div>

      {/* </div> */}
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

      </div>
    </div>
  );
};

export default CopilotSection;
