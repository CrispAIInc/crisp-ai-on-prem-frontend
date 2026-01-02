import ReactDOM from 'react-dom/client';
import './main.css';
import App from './App';
import { pdfjs } from 'react-pdf';

import { Provider } from "react-redux";
import store from "./store";

import ThemeProvider from "./contexts/themeContext.jsx";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  <Provider store={store}>
    {/* <ThemeProvider> */}
    <App />
    {/* </ThemeProvider> */}
  </Provider>
  // </React.StrictMode>
);