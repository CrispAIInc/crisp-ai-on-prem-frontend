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
import AuthProvider from './contexts/authContext.jsx';
import MainProvider from './contexts/mainContext.jsx';
import SettingsProvider from './contexts/settingsContext.jsx';
import VerifyAccount from './components/VerifyAccount';
import AuthRoute from './components/Auth/AuthRoute.jsx';
import UploadSimulator from './components/UploadSimulator/index.jsx';


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
      <UploadSimulator />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<PrivateRoute><MainProvider theme={theme} setTheme={setTheme}><SettingsProvider><MainWorkspacePage /></SettingsProvider></MainProvider></PrivateRoute>} />

            <Route path="/sign-up" element={<AuthRoute><RegisterPage theme={theme} setTheme={setTheme} /></AuthRoute>} />
            <Route path="/verify" element={<AuthRoute><VerifyAccount theme={theme} setTheme={setTheme} /></AuthRoute>} />
            <Route path="/login" element={<AuthRoute><LoginPage theme={theme} setTheme={setTheme} /></AuthRoute>} />
            <Route path="/forgot-password" element={<AuthRoute><ForgotPasswordPage theme={theme} setTheme={setTheme} /></AuthRoute>} />
            <Route path="/reset-password" element={<AuthRoute><ResetPasswordPage theme={theme} setTheme={setTheme} /></AuthRoute>} />
            <Route path="*" element={<NotFound theme={theme} setTheme={setTheme} />} />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;