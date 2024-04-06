// import React, { useState, useRef, useEffect } from 'react';
// import axios from 'axios';
// import ReactPlayer from 'react-player';
// import LoadingSpinner from '../LoadingSpinner';
// import { CentralModalOne, CentralModalTwo, CentralModalThree } from '../Modal';
// import Button from 'react-bootstrap/Button';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import VideoThumbnail from '../VideoThumbnail';
// import CancelIcon from '@mui/icons-material/Cancel';
// import DeleteIcon from '@mui/icons-material/Delete';
// import './video_page.css';
// import Select from 'react-select';

// const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

// function VideoUploader() {
//   const [videoURL, setVideoURL] = useState(null);
//   const [query, setQuery] = useState('');
//   const player = useRef(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);

//   const [summary, setSummary] = useState('');
//   const [summaries, setSummaries] = useState('');
//   const [modalOneShow, setModalOneShow] = React.useState(false);
//   const [modalTwoShow, setModalTwoShow] = React.useState(false);
//   const [modalThreeShow, setModalThreeShow] = React.useState(false);

//   // uploaded videos list 
//   const [transcription, setTranscription] = useState([]);
//   const [data, setData] = useState([]);
//   const [currentVideo, setCurrentVideo] = useState('');

//   const [isDeleting, setIsDeleting] = useState(false);
//   const [clickedIndex, setClickedIndex] = useState(0);

//   const [selectedCategory, setSelectedCategory] = useState('all');

//   // Create options for the select dropdown
//   const categoryOptions = [
//     { value: 'all', label: 'All' },
// { value: "generic", label: "Generic" },
//     { value: 'investment', label: 'Investment' },
//     { value: 'human resources', label: 'Human Resources' },
//     { value: 'customer interaction', label: 'Customer Interaction' },
//     { value: 'documentaries', label: 'Documentaries' },
//     { value: 'entertainment', label: 'Entertainment' },
//     { value: 'insurance', label: 'Insurance' }
//   ];

//   const videoDataFromChat = JSON.parse(localStorage.getItem('videoData') || '{}');
//   console.log(videoDataFromChat); // This should log { someProp: 'value' }

//   useEffect(() => {
//     fetch(`${API_ENDPOINT}/video_data/${selectedCategory}`)
//       .then(response => response.json())
//       .then(data => setData(data))
//       .catch(error => console.error(error));

//     if (Object.keys(videoDataFromChat).length > 0) {
//       setVideoURL(`${API_ENDPOINT}/videos/${selectedCategory}/${encodeURIComponent(videoDataFromChat.video_path[0])}`);
//       sleep(2000).then(() => {
//         console.log(timeToSeconds(videoDataFromChat.video_path[1]));
//         player.current.seekTo(timeToSeconds(videoDataFromChat.video_path[1]));
//         setTranscription(videoDataFromChat.video_path[2]);
//         setSummary(videoDataFromChat.video_path[3]);
//         setSummaries(videoDataFromChat.video_path[4]);
//         localStorage.removeItem('videoData');
//       });
//     }
//   }, []);

//   useEffect(() => {
//     fetch(`${API_ENDPOINT}/video_data/${selectedCategory}`)
//       .then(response => response.json())
//       .then(data => setData(data))
//       .catch(error => console.error(error));
//   }, [selectedCategory]);

//   function timeToSeconds(time) {
//     const parts = time.split(':');
//     const hours = parseInt(parts[0], 10);
//     const minutes = parseInt(parts[1], 10);
//     const seconds = parseInt(parts[2], 10);

//     return hours * 3600 + minutes * 60 + seconds;
//   }

//   const handleVideosUpload = async (event) => {
//     setIsUploading(true);
//     const files = Array.from(event.target.files);

//     const formData = new FormData();
//     files.forEach((file) => {
//       formData.append('file', file);
//     });

//     formData.append('category', selectedCategory);

//     const response = await axios.post(`${API_ENDPOINT}/upload-videos`, formData);

//     if (response.status === 200) {
//       fetch(`${API_ENDPOINT}/video_data/${selectedCategory}`)
//         .then(response => response.json())
//         .then(data => setData(data))
//         .catch(error => console.error(error));
//       setIsUploading(false);
//     }
//     else {
//       setIsUploading(false);
//     }
//   };

//   const deleteVideo = async (event, idx) => {
//     try {
//       setIsDeleting(true);
//       setClickedIndex(idx);
//       const response = await axios.post(`${API_ENDPOINT}/delete`, { category: selectedCategory, fileName: data[idx].video_path, fileType: 'video' });
//       if (response.status === 200) {
//         console.log(response);
//         setIsDeleting(false);
//         fetch(`${API_ENDPOINT}/video_data/${selectedCategory}`)
//           .then(response => response.json())
//           .then(data => setData(data))
//           .catch(error => console.error(error));
//       }
//       else {
//         setIsDeleting(false);
//       }
//     }
//     catch (error) {
//       console.log(error);
//     }
//   };

//   const handleQueryChange = (event) => {
//     setQuery(event.target.value);
//   };

//   const sleep = ms => new Promise(r => setTimeout(r, ms));

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setIsProcessing(true);
//     try {
//       const response = await axios.post(`${API_ENDPOINT}/process-query`, { category: selectedCategory, query, currentVideo });
//       console.log(response);
//       if (response.status === 200) {
//         console.log(response.data);
//         const videoURL = `${API_ENDPOINT}/videos/${selectedCategory}/${encodeURIComponent(response.data.video_path)}`;
//         console.log(videoURL);
//         setVideoURL(videoURL);
//         const timestamp = response.data.timestamp;
//         console.log(timestamp);
//         await sleep(1000);

//         player.current.seekTo(timestamp);
//         // player.current.seekTo(timestamp);  

//         setIsProcessing(false);

//         setTranscription(response.data.transcript);
//         setSummary(response.data.summary);
//         setSummaries(response.data.topic_summaries);


//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const onThumbnailClick = (event, index) => {
//     event.preventDefault();
//     const idx = index;
//     const videoURL = `${API_ENDPOINT}/videos/${selectedCategory}/${encodeURIComponent(data[idx].video_path)}`;
//     setCurrentVideo(data[idx].video_path);
//     setVideoURL(videoURL);
//     setTranscription(data[idx].transcript);
//     setSummary(data[idx].summary);
//     setSummaries(data[idx].topic_summaries);
//   };

//   const closeVideo = (event) => {
//     event.preventDefault();
//     setCurrentVideo('');
//     setVideoURL(null);
//     setTranscription('');
//     setSummary('');
//     setSummaries('');
//   };

//   // const handleCategoryChange = async (selectedOption) => {
//   //   setSelectedCategory(selectedOption);
//   //   const response = await axios.post(`${API_ENDPOINT}/video_data/${selectedCategory}`);
//   //   console.log(response);

//   //   if (response.status === 200) {
//   //     response = response.json();
//   //     setData(response)        
//   //   }
//   // };

//   return (
//     <div className='container'>
//       <div className='header'>
//         <img src='./imgs/logo.png' />
//       </div>
//       {/* <Navbar/> */}
//       <div className='navbar'>
//         <Button variant="primary" onClick={() => setModalOneShow(true)}>
//           Transcript
//         </Button>
//         <Button variant="primary" onClick={() => setModalTwoShow(true)}>
//           Summary
//         </Button>
//         <Button variant="primary" onClick={() => setModalThreeShow(true)}>
//           Topic by topic summary
//         </Button>
//       </div>


//       <CentralModalOne
//         show={modalOneShow}
//         onHide={() => setModalOneShow(false)}
//         transcription={transcription}
//         className="modal"
//       />
//       <CentralModalTwo
//         show={modalTwoShow}
//         onHide={() => setModalTwoShow(false)}
//         summary={summary}
//         className="modal"
//       />
//       <CentralModalThree
//         show={modalThreeShow}
//         onHide={() => setModalThreeShow(false)}
//         summaries={summaries}
//         className="modal"
//       />

//       <div className='container-2'>
//         <div className='left-panel'>
//           <div>
//             <label for="upload-files" class="upload-button">{isUploading ? <div className='video-spinner-container'><LoadingSpinner videoSpinner={true} /></div> : 'Upload Videos'}</label>
//             <input id="upload-files" type="file" multiple style={{ display: 'none' }} onChange={handleVideosUpload} />
//           </div>

//           <form onSubmit={handleSubmit}>
//             <input type="text" placeholder="Enter your question" value={query} onChange={handleQueryChange} />
//             <button type="submit" className='submit-button'>{isProcessing ? <div className='video-spinner-container'><LoadingSpinner videoSpinner={true} /></div> : 'Submit'}</button>
//           </form>
//         </div>
//         <div className='right-panel'>
//           {videoURL ? <CancelIcon onClick={closeVideo} className='cancel-icon' /> : null}
//           <ReactPlayer id='react-player' width={'100%'} height={'100%'} ref={player} playing={true} url={videoURL} controls />
//         </div>

//       </div>
//       <div>

//         <div className='uploaded-videos'>
//           <div className='workspace-heading'>
//             <h1>Your Workspace</h1>
//             <Select className='category-select' defaultValue={categoryOptions[0]} menuPlacement={"auto"}
//               onChange={(e) => setSelectedCategory(e.value)} options={categoryOptions} />
//           </div>
//           <div className="thumbnails">
//             {data.filter(item =>
//               !selectedCategory || item.category === selectedCategory
//             ).map((item, index) => (
//               <div className='thumbnail-container' key={index}>
//                 {isDeleting && clickedIndex == index ? <div className='thumbnail-loader'><LoadingSpinner /></div> : null}
//                 <div onClick={event => onThumbnailClick(event, index)}>
//                   <VideoThumbnail item={item} />
//                 </div>
//                 <DeleteIcon onClick={event => deleteVideo(event, index)} className='delete-icon' />
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//     </div>
//   );
// }

// export default VideoUploader;
