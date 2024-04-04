// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import LoadingSpinner from '../LoadingSpinner';
// import { CentralModalOne, CentralModalTwo, CentralModalThree } from '../Modal';
// import Button from 'react-bootstrap/Button';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import PDFThumbnail from '../PDFThumbnail';
// import './pdf_page.css';
// import Select from 'react-select';

// // Core viewer
// import { Viewer } from '@react-pdf-viewer/core';
// import { Worker } from '@react-pdf-viewer/core';

// import '@react-pdf-viewer/core/lib/styles/index.css';
// import { searchPlugin } from '@react-pdf-viewer/search';

// // Import styles
// import '@react-pdf-viewer/search/lib/styles/index.css';
// import '@react-pdf-viewer/core/lib/styles/index.css';
// import '@react-pdf-viewer/default-layout/lib/styles/index.css';
// import CancelIcon from '@mui/icons-material/Cancel';
// import '@react-pdf-viewer/page-navigation/lib/styles/index.css';
// import DeleteIcon from '@mui/icons-material/Delete';

// const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;


// function PDFSearchPage() {
//   const [query, setQuery] = useState('');
//   const [isUploading, setIsUploading] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [summary, setSummary] = useState('');
//   const [summaries, setSummaries] = useState('');

//   const [modalOneShow, setModalOneShow] = React.useState(false);
//   const [modalTwoShow, setModalTwoShow] = React.useState(false);
//   const [modalThreeShow, setModalThreeShow] = React.useState(false);

//   const [transcription, setTranscription] = useState([]);

//   const [pdfData, setPDFData] = useState([]);
//   const [pdfURL, setPDFURL] = useState(null);

//   const searchPluginInstance = searchPlugin();
//   const { highlight } = searchPluginInstance;

//   const [currentPDF, setCurrentPDF] = useState('');

//   const [textResult, setTextResult] = useState('');

//   const [pageNumber, setPageNumber] = useState(0);

//   const [isDeleting, setIsDeleting] = useState(false);
//   const [clickedIndex, setClickedIndex] = useState(0);

//   const [selectedPDFCategory, setSelectedPDFCategory] = useState('all');

//   const pdfCategoryOptions = [
//     { value: 'all', label: 'All' },
//     { value: 'investment', label: 'Investment' },
//     { value: 'human resources', label: 'Human Resources' },
//     { value: 'customer interaction', label: 'Customer Interaction' },
//     { value: 'miscelaneous', label: 'Miscelaneous' },
//     { value: 'technical content', label: 'Technical Content' },
//     { value: 'insurance', label: ' Insurance' }
//   ];

//   const pdfDataFromChat = JSON.parse(localStorage.getItem('pdfData') || '{}');


//   useEffect(() => {
//     fetch(`${API_ENDPOINT}/pdf_data/${selectedPDFCategory}`)
//       .then(response => response.json())
//       .then(pdfData => setPDFData(pdfData))
//       .catch(error => console.error(error));
//     console.log(pdfData);
//     if (Object.keys(pdfDataFromChat).length > 0) {
//       if (pdfDataFromChat.pdf_path[1] != 'Not Precised') {
//         console.log(pdfDataFromChat.pdf_path[1]);
//         setPageNumber(pdfDataFromChat.pdf_path[1]);
//         setTranscription(pdfDataFromChat.pdf_path[2]);
//         setSummary(pdfDataFromChat.pdf_path[3]);
//         setSummaries(pdfDataFromChat.pdf_path[4]);
//         localStorage.removeItem('pdfData');
//       }
//       setPDFURL(`${API_ENDPOINT}/pdfs/${selectedPDFCategory}/${encodeURIComponent(pdfDataFromChat.pdf_path[0])}`);
//     }
//   }, []);

//   useEffect(() => {
//     fetch(`${API_ENDPOINT}/pdf_data/${selectedPDFCategory}`)
//       .then(response => response.json())
//       .then(data => setPDFData(data))
//       .catch(error => console.error(error));
//   }, [selectedPDFCategory]);


//   useEffect(() => {
//     if (textResult) {
//       highlight({
//         keyword: textResult,
//         matchCase: false,
//         wholeWords: false,
//       });
//     }
//   }, [textResult]);

//   const handlePDFsUpload = async (event) => {
//     setIsUploading(true);
//     const files = Array.from(event.target.files);

//     const formData = new FormData();
//     files.forEach((file) => {
//       formData.append('file', file);
//     });

//     formData.append('category', selectedPDFCategory);

//     const response = await fetch(`${API_ENDPOINT}/upload-pdfs`, {
//       method: 'POST',
//       body: formData,
//     });

//     if (response.status === 200) {
//       fetch(`${API_ENDPOINT}/pdf_data/${selectedPDFCategory}`)
//         .then(response => response.json())
//         .then(data => setPDFData(data))
//         .then(setIsUploading(false))
//         .catch(error => console.error(error));
//     }
//   };

//   const deletePDF = async (event, idx) => {
//     try {
//       setIsDeleting(true);
//       setClickedIndex(idx);
//       const response = await axios.post(`${API_ENDPOINT}/delete`, { category: selectedPDFCategory, fileName: pdfData[idx].pdf_path, fileType: 'pdf' });
//       if (response.status === 200) {
//         console.log(response);
//         setIsDeleting(false);
//         fetch(`${API_ENDPOINT}/pdf_data/${selectedPDFCategory}`)
//           .then(response => response.json())
//           .then(data => setPDFData(data))
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
//       const response = await axios.post(`${API_ENDPOINT}/process-query-pdf`, { category: selectedPDFCategory, query, currentPDF });
//       console.log(response);
//       if (response.status === 200) {
//         console.log(response.data);

//         const pdfURL = `${API_ENDPOINT}/pdfs/${selectedPDFCategory}/${encodeURIComponent(response.data.pdf_path)}`;
//         console.log(pdfURL);

//         setPDFURL(pdfURL);
//         await sleep(2000);

//         setIsProcessing(false);

//         const text = response.data.paragraph;
//         // console.log('Text', text)
//         setTextResult(text);

//         // console.log(response.data.transcript, response.data.summary, response.data.topic_summaries);
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
//     const pdfURL = `${API_ENDPOINT}/pdfs/${selectedPDFCategory}/${encodeURIComponent(pdfData[idx].pdf_path)}`;
//     setCurrentPDF(pdfData[idx].pdf_path);
//     setPDFURL(pdfURL);
//     setTranscription(pdfData[idx].transcript);
//     setSummary(pdfData[idx].summary);
//     setSummaries(pdfData[idx].topic_summaries);
//   };

//   const closePDF = (event) => {
//     event.preventDefault();
//     setCurrentPDF('');
//     setPDFURL(null);
//     setTranscription('');
//     setSummary('');
//     setSummaries('');
//   };

//   return (
//     // <Routes>
//     <div className='container'>
//       <div className='header'>
//         <img src='./imgs/logo.png' />
//       </div>

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
//             <label for="upload-files" class="upload-button">{isUploading ? <div className='pdf-spinner-container'><LoadingSpinner videoSpinner={true} /></div> : 'Upload PDFs'}</label>
//             <input id="upload-files" type="file" multiple style={{ display: 'none' }} onChange={handlePDFsUpload} />
//           </div>
//           <form onSubmit={handleSubmit}>
//             <input type="text" placeholder="Enter your question" value={query} onChange={handleQueryChange} />
//             <button type="submit" className='submit-button'>{isProcessing ? <div className='pdf-spinner-container'><LoadingSpinner videoSpinner={true} /></div> : 'Submit'}</button>
//           </form>
//         </div>
//         <div className='right-panel'>
//           {pdfURL ? <CancelIcon onClick={closePDF} className='cancel-icon' /> : null}

//           {pdfURL ? <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.10.111/build/pdf.worker.min.js">
//             <Viewer fileUrl={pdfURL} initialPage={pageNumber} plugins={[searchPluginInstance]} />
//           </Worker>
//             :
//             null}
//         </div>

//       </div>

//       <div>

//         <div className='uploaded-videos'>
//           <div className='workspace-heading'>
//             <h1>Your Workspace</h1>
//             <Select className='category-select' defaultValue={pdfCategoryOptions[0]} menuPlacement={"auto"}
//               onChange={(e) => setSelectedPDFCategory(e.value)} options={pdfCategoryOptions} />
//           </div>
//           <div className="thumbnails">
//             {pdfData.filter(item =>
//               !selectedPDFCategory || item.category === selectedPDFCategory
//             ).map((item, index) => (
//               <div className='thumbnail-container' key={index}>
//                 {isDeleting && clickedIndex == index ? <div className='thumbnail-loader'><LoadingSpinner /></div> : null}
//                 <div onClick={event => onThumbnailClick(event, index)}>
//                   <PDFThumbnail item={item} />
//                 </div>
//                 <DeleteIcon onClick={event => deletePDF(event, index)} className='delete-icon' />
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//     </div>
//   );
// }

// export default PDFSearchPage;
