import React, { useState, useEffect } from 'react';
import './chat.css'
import SendIcon from '@mui/icons-material/Send';
import LoadingSpinner from '../LoadingSpinner';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import axios from 'axios';

function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatLoaded, setChatLoaded] = useState('');
  const [coorgToLanguage, setCoorgToLanguage] = useState('afrikaans');
  const [userToLanguage, setUserToLanguage] = useState('afrikaans');
  const [originalQueries, setOriginalQueries] = useState([]);
  const [originalResponses, setOriginalResponses] = useState([]);
  const [isTranslatingUser, setIsTranslatingUser] = useState(false);
  const [isTranslatingCoorg, setIsTranslatingCoorg] = useState(false);
  const [clickedIndex, setClickedIndex] = useState(0);
  const [responseIndex, setResponseIndex] = useState(-1);
  const [gptModel, setGptModel] = useState('gpt-4');
  const [selectedPersona, setSelectedPersona] = useState('all');

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const languageOptions = [
        {value: 'af', label: 'afrikaans'},
        {value: 'sq', label: 'albanian'},
        {value: 'am', label: 'amharic'},
        {value: 'ar', label: 'arabic'},
        {value: 'hy', label: 'armenian'},
        {value: 'as', label: 'assamese'},
        {value: 'ay', label: 'aymara'},
        {value: 'az', label: 'azerbaijani'},
        {value: 'bm', label: 'bambara'},
        {value: 'eu', label: 'basque'},
        {value: 'be', label: 'belarusian'},
        {value: 'bn', label: 'bengali'},
        {value: 'bho', label: 'bhojpuri'},
        {value: 'bs', label: 'bosnian'},
        {value: 'bg', label: 'bulgarian'},
        {value: 'ca', label: 'catalan'},
        {value: 'ceb', label: 'cebuano'},
        {value: 'ny', label: 'chichewa'},
        {value: 'zh-CN', label: 'chinese (simplified)'},
        {value: 'zh-TW', label: 'chinese (traditional)'},
        {value: 'co', label: 'corsican'},
        {value: 'hr', label: 'croatian'},
        {value: 'cs', label: 'czech'},
        {value: 'da', label: 'danish'},
        {value: 'dv', label: 'dhivehi'},
        {value: 'doi', label: 'dogri'},
        {value: 'nl', label: 'dutch'},
        {value: 'en', label: 'english'},
        {value: 'eo', label: 'esperanto'},
        {value: 'et', label: 'estonian'},
        {value: 'ee', label: 'ewe'},
        {value: 'tl', label: 'filipino'},
        {value: 'fi', label: 'finnish'},
        {value: 'fr', label: 'french'},
        {value: 'fy', label: 'frisian'},
        {value: 'gl', label: 'galician'},
        {value: 'ka', label: 'georgian'},
        {value: 'de', label: 'german'},
        {value: 'el', label: 'greek'},
        {value: 'gn', label: 'guarani'},
        {value: 'gu', label: 'gujarati'},
        {value: 'ht', label: 'haitian creole'},
        {value: 'ha', label: 'hausa'},
        {value: 'haw', label: 'hawaiian'},
        {value: 'iw', label: 'hebrew'},
        {value: 'hi', label: 'hindi'},
        {value: 'hmn', label: 'hmong'},
        {value: 'hu', label: 'hungarian'},
        {value: 'is', label: 'icelandic'},
        {value: 'ig', label: 'igbo'},
        {value: 'ilo', label: 'ilocano'},
        {value: 'id', label: 'indonesian'},
        {value: 'ga', label: 'irish'},
        {value: 'it', label: 'italian'},
        {value: 'ja', label: 'japanese'},
        {value: 'jw', label: 'javanese'},
        {value: 'kn', label: 'kannada'},
        {value: 'kk', label: 'kazakh'},
        {value: 'km', label: 'khmer'},
        {value: 'rw', label: 'kinyarwanda'},
        {value: 'gom', label: 'konkani'},
        {value: 'ko', label: 'korean'},
        {value: 'kri', label: 'krio'},
        {value: 'ku', label: 'kurdish (kurmanji)'},
        {value: 'ckb', label: 'kurdish (sorani)'},
        {value: 'ky', label: 'kyrgyz'},
        {value: 'lo', label: 'lao'},
        {value: 'la', label: 'latin'},
        {value: 'lv', label: 'latvian'},
        {value: 'ln', label: 'lingala'},
        {value: 'lt', label: 'lithuanian'},
        {value: 'lg', label: 'luganda'},
        {value: 'lb', label: 'luxembourgish'},
        {value: 'mk', label: 'macedonian'},
        {value: 'mai', label: 'maithili'},
        {value: 'mg', label: 'malagasy'},
        {value: 'ms', label: 'malay'},
        {value: 'ml', label: 'malayalam'},
        {value: 'mt', label: 'maltese'},
        {value: 'mi', label: 'maori'},
        {value: 'mr', label: 'marathi'},
        {value: 'mni-Mtei', label: 'meiteilon (manipuri)'},
        {value: 'lus', label: 'mizo'},
        {value: 'mn', label: 'mongolian'},
        {value: 'my', label: 'myanmar'},
        {value: 'ne', label: 'nepali'},
        {value: 'no', label: 'norwegian'},
        {value: 'or', label: 'odia (oriya)'},
        {value: 'om', label: 'oromo'},
        {value: 'ps', label: 'pashto'},
        {value: 'fa', label: 'persian'},
        {value: 'pl', label: 'polish'},
        {value: 'pt', label: 'portuguese'},
        {value: 'pa', label: 'punjabi'},
        {value: 'qu', label: 'quechua'},
        {value: 'ro', label: 'romanian'},
        {value: 'ru', label: 'russian'},
        {value: 'sm', label: 'samoan'},
        {value: 'sa', label: 'sanskrit'},
        {value: 'gd', label: 'scots gaelic'},
        {value: 'nso', label: 'sepedi'},
        {value: 'sr', label: 'serbian'},
        {value: 'st', label: 'sesotho'},
        {value: 'sn', label: 'shona'},
        {value: 'sd', label: 'sindhi'},
        {value: 'si', label: 'sinhala'},
        {value: 'sk', label: 'slovak'},
        {value: 'sl', label: 'slovenian'},
        {value: 'so', label: 'somali'},
        {value: 'es', label: 'spanish'},
        {value: 'su', label: 'sundanese'},
        {value: 'sw', label: 'swahili'},
        {value: 'sv', label: 'swedish'},
        {value: 'tg', label: 'tajik'},
        {value: 'ta', label: 'tamil'},
        {value: 'tt', label: 'tatar'},
        {value: 'te', label: 'telugu'},
        {value: 'th', label: 'thai'},
        {value: 'ti', label: 'tigrinya'},
        {value: 'ts', label: 'tsonga'},
        {value: 'tr', label: 'turkish'},
        {value: 'tk', label: 'turkmen'},
        {value: 'ak', label: 'twi'},
        {value: 'uk', label: 'ukrainian'},
        {value: 'ur', label: 'urdu'},
        {value: 'ug', label: 'uyghur'},
        {value: 'uz', label: 'uzbek'},
        {value: 'vi', label: 'vietnamese'},
        {value: 'cy', label: 'welsh'},
        {value: 'xh', label: 'xhosa'},
        {value: 'yi', label: 'yiddish'},
        {value: 'yo', label: 'yoruba'},
        {value: 'zu', label: 'zulu'}
    ]

  const personasCategories = [
    { value: 'all', label: 'General Persona' },
    { value: 'investment', label: 'Investment Persona' },
    { value: 'human resources', label: 'HR Persona' },
    { value: 'customer interaction', label: 'Customer Persona' },
    { value: 'documentaries', label: 'Documentaries Persona' },
    { value: 'entertainment', label: 'Entertainment Persona' },
    { value: 'technical content', label: 'Technology Persona' },
    { value: 'miscelaneous', label: 'Miscelaneous Persona' },
    { value: 'insurance', label: 'Insurance Persona' },
  ];


  const [showCursor, setShowCursor] = useState(false);

  useEffect(() => {
    setChatLoaded('')
    fetch(`http://localhost:5000/chat/${selectedPersona}`)
      .then(response => response.json())
      .then(data => {
        return sleep(4000).then(() => data);  // Introduce a delay and then return the data
      })
      .then(data => setChatLoaded(data))
      .catch(error => console.error(error));
  }, [selectedPersona]);

  const handleVideoLinkClick = (video_path) => {
    localStorage.setItem('videoData', JSON.stringify({ video_path: video_path }));
  };
  
  const handlePDFLinkClick = (pdf_path) => {
    localStorage.setItem('pdfData', JSON.stringify({ pdf_path: pdf_path }));
  }; 

  const SendMessage = async () => {
    setShowCursor(true);
    const userMessage = input;
    setOriginalQueries([...originalQueries, userMessage]);
    setMessages([...messages, { sender: 'user', text: userMessage }, { sender: 'bot', text: '' }]);
    setInput('');
    setResponseIndex(responseIndex => responseIndex + 2);
  
    let sessionID = null; // Variable to store the session ID
  
    const eventSource = new EventSource(`http://localhost:5000/message/${encodeURIComponent(selectedPersona)}/${encodeURIComponent(userMessage)}/${encodeURIComponent(gptModel)}`);
    
    var botMessage = '';
  
    eventSource.onmessage = function(event) {
      const data = JSON.parse(event.data);

      if (data.type === 'SESSION_ID') {
        sessionID = data.session_id;
        console.log('Received session ID:', sessionID);
      }
      else if (data.type === 'MESSAGE') {
        const newToken = data.text;
        botMessage += ' ' + newToken;
        setMessages(prevMessages => {
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
  
    eventSource.onerror = function(event) {
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
  };
  
  const fetchReferences = async (botMessage) => {
    const response = await axios.get(`http://localhost:5000/references`);
    const data = response.data;
    console.log(response)
    // Assuming handleVideoLinkClick and handlePDFLinkClick are already defined
    console.log(data);
    const videoLinks = data.video_references.map(video_path => (
      <li key={video_path}>
        <Link target={"_blank"} to={"/videos"} onClick={() => handleVideoLinkClick(video_path)}>{video_path[0] + ' | Timestamp: ' + video_path[1]}</Link> 
      </li>
    ));
    const pdfLinks = data.pdf_references.map(pdf_path => (
      <li key={pdf_path}>
        <Link target={"_blank"} to={"/pdfs"} onClick={() => handlePDFLinkClick(pdf_path)}>{pdf_path[0] + ' | Page: ' + (parseInt(pdf_path[1])+1)}</Link> 
      </li>
    ));
    
    console.log(videoLinks, pdfLinks)

    // Append the references to the botMessage
    botMessage = (
      <div>
        <div className='coorg-response'>{data.bot_message}</div>
        <br/> 
        {
          videoLinks && pdfLinks &&
          <div>
          <p>References:</p>
          <ul>{videoLinks}</ul>
          <ul>{pdfLinks}</ul>
          </div>
        }
      </div>
    );

    // Update the messages with the references
    setMessages(prevMessages => {
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
      // });
  };
  
  function NewlineText({ text }) {
    const newText = text.split('\n').map((str, index, array) => 
      index === array.length - 1 ? str : <>
        {str}
        <br />
      </>
    );
  
    return <>{newText}</>;
  }

  const translateQuery = async (index) => {
    setClickedIndex(index)
    setIsTranslatingUser(true);
    const response = await fetch('http://localhost:5000/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: originalQueries[parseInt(index/2)], language: userToLanguage })
    });
    const data = await response.json();

    if (response.status === 200) setIsTranslatingUser(false);

    var messageDiv = document.querySelectorAll(".user-message")
    messageDiv = messageDiv[parseInt(index/2)]
    messageDiv.innerHTML = `<b>You: </b>` + data.translatedText
  } 

  const translateResponse = async (index) => {
    setClickedIndex(index)
    setIsTranslatingCoorg(true);
    const response = await fetch('http://localhost:5000/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: originalResponses[parseInt(index/2)], language: coorgToLanguage })
    });
    const data = await response.json();

    if (response.status === 200) setIsTranslatingCoorg(false);

    var responseDiv = document.querySelectorAll(".coorg-response")
    responseDiv = responseDiv[parseInt(index/2)]
    responseDiv.innerHTML = data.translatedText
  }

  const handleChange = (event, model) => {
    setGptModel(model);
  };

  return (
    <div className="App ChatApp">
      <div className='header'>
        <img src='./imgs/logo.png'/>
      </div>
      {/* <div className='model-toggle-container'>
        <ToggleButtonGroup
        color="primary"
        value={gptModel}
        exclusive
        onChange={handleChange}
        aria-label="Model"
        >
          <ToggleButton value="gpt-3.5-turbo">gpt-3.5-turbo</ToggleButton>
          <ToggleButton value="gpt-4">gpt-4</ToggleButton>
        </ToggleButtonGroup>
      </div> */}
      <Select className='persona-select'
              defaultValue={personasCategories[0]}
              onChange={(e) => setSelectedPersona(e.value)} options={personasCategories} />

      <div className="chat-window">
          {
            chatLoaded ?
              (messages.map((message, index) => (
                index%2 == 0 ?
                <div key={index}>
                  <div className={`message user-message`}>
                    <b>You: </b>{message.text}
                  </div>
                  <div className='language-div'>
                    <p className='translate-text'>Translate this question to: </p><Select className='language-select' defaultValue={languageOptions[0]} menuPlacement={"auto"} onChange={(e) => setUserToLanguage(e.label)} options={languageOptions} />
                    <button className='translate-button' onClick={() => translateQuery(index)} disabled={isTranslatingUser ? true:false}
                    > {isTranslatingUser && index == clickedIndex ? <div className='translate-spinner'><LoadingSpinner/></div> : 'Translate'}</button>
                  </div>
                </div> 
                :
                <>
                  <div key={index}>
                      <div className={`message bot-message`}>
                        <b>CoorgAI: </b> <div>{message.text} {showCursor && index == responseIndex ? <div className="cursor"></div> : null}</div> 
                      </div>
                      <div className='language-div'>
                        <p className='translate-text'>Translate this answer to: </p><Select className='language-select' defaultValue={languageOptions[0]} menuPlacement={"auto"} onChange={(e) => setCoorgToLanguage(e.label)} options={languageOptions} />
                        <button className='translate-button' onClick={() => translateResponse(index)} disabled={isTranslatingCoorg ? true:false}
                        > {isTranslatingCoorg  && index == clickedIndex ? <div className='translate-spinner'><LoadingSpinner/></div> : 'Translate'}</button>
                      </div>
                  </div>
                </>
            )))
            
            :
              <div className='loading-container'>
                <div className='chat-spinner'>
                  <LoadingSpinner/>
                </div>
                <p className='loading-text'>Loading Knowledge Base, Please wait a few seconds ...</p>
              </div>
          }
      </div>
      <div className="input-area">
        <input className='message-input-field' value={input} onChange={e => setInput(e.target.value)} />
        <button className='send-message-chat' onClick={SendMessage} disabled={chatLoaded ? false:true} 
          style={{backgroundColor: (chatLoaded ? '#0084FF':'#0084ff6a')}}
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}


export default ChatApp;
