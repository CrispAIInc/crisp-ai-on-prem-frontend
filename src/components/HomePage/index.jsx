import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import './home.css';

import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import ChatIcon from '@mui/icons-material/Chat';

function HomePage({ item }) {
    return (
      <div className='home-container'>
        <div className='header'>
          <img src='./imgs/logo.png'/>
        </div>
        <div className='links-container'>
          <Link className='main-button pdf-button' to="/pdfs">
            <PictureAsPdfIcon className='main-icon' fontSize='inherit'/>
            <p className='section-title'>PDF Search</p>
          </Link>       
          <Link className='main-button' to="/videos">
            <VideoLibraryIcon className='main-icon' fontSize='inherit'/>
            <p className='section-title'>Video Search</p>
          </Link>
          <Link className='main-button chat-button' to="/chat">
            <ChatIcon className='main-icon' fontSize='inherit'/>
            <p className='section-title'>CoorgChat</p>
          </Link>
        </div>
      </div>
      
    );
  }

export default HomePage