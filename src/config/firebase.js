// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// const firebaseConfig = {
//     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
// };

// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);

const firebaseConfig = {
    apiKey: "AIzaSyDe2BEaMyhQTugA9ZdWC5MlJQCqtdOVjXo",
    authDomain: "crispai-app-462614.firebaseapp.com",
    projectId: "crispai-app-462614",
    storageBucket: "crispai-app-462614.firebasestorage.app",
    messagingSenderId: "843040371870",
    appId: "1:843040371870:web:ad761e88bdca291908f78f",
    measurementId: "G-D6J7KPEZK1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// const analytics = getAnalytics(app);