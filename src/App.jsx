import './App.css';
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import { useState, useEffect, useLayoutEffect } from 'react';
import { toastConfig } from 'react-simple-toasts';
import 'react-simple-toasts/dist/theme/dark.css';
import MainWorkspacePage from './pages/MainWorkspacePage';
import NotFound from './pages/NotFound';
import RegisterPage from './pages/Auth/RegisterPage';
import LoginPage from './pages/Auth/LoginPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import PrivateRoute from './components/Auth/PrivateRoute';
import { AuthProvider } from './contexts/authContext';


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
      if ((event.ctrlKey && event.key === 't') || (event.ctrlKey && event.key === 'T') || (event.metaKey && event.key === 't') || (event.metaKey && event.key === 'T') || (event.metaKey && event.key === 't')) {
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
      <AuthProvider>
        <Router>
          <Routes>
            {/* <Route path="/" element={<HomePage theme={theme} />} /> */}

            <Route path="/" element={<PrivateRoute><MainWorkspacePage setTheme={setTheme} theme={theme} /></PrivateRoute>} />

            <Route path="/sign-up" element={<RegisterPage theme={theme} setTheme={setTheme} />} />
            <Route path="/login" element={<LoginPage theme={theme} setTheme={setTheme} />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage theme={theme} setTheme={setTheme} />} />
            <Route path="/reset-password" element={<ResetPasswordPage theme={theme} setTheme={setTheme} />} />
            <Route path="*" element={<NotFound theme={theme} setTheme={setTheme} />} />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;