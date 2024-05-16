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


function App() {

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  toastConfig({ theme });

  useLayoutEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    function handleKeyDown(event) {
      // Check if CTRL key and 't' key are pressed simultaneously
      if (event.ctrlKey && event.key === 't') {
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
          <Route path="/" element={<MainWorkspace theme={theme} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;