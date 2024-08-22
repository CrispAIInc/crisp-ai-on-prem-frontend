import './App.css';
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import MainWorkspace from './components/MainWorkspace';
import { useState, useEffect, useLayoutEffect } from 'react';
import { toastConfig } from 'react-simple-toasts';
import 'react-simple-toasts/dist/theme/dark.css';
import HomePage from './pages/HomePage';
import MainWorkspacePage from './pages/MainWorkspacePage';


function App() {

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  toastConfig({ theme });

  useLayoutEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    function handleKeyDown(event) {
      // Check if CTRL key and 't' key are pressed simultaneously
      // handle the case for command on mac as well
      if ((event.ctrlKey && event.key === 't') || (event.ctrlKey && event.key === 'T') || (event.metaKey && event.key === 't') || (event.metaKey && event.key === 'T')) {
        // Call your function here
        setTheme((theme) => theme === 'light' ? 'dark' : 'light');
      }
    }

    // Add event listener when component mounts
    window.addEventListener('keydown', handleKeyDown);

    // Remove event listener when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className={`App ${theme}`}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage theme={theme} />} />
          <Route path="/workspace" element={<MainWorkspacePage theme={theme} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;