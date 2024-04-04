import './App.css';
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import MainWorkspace from './components/MainWorkspace';

function App() {

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<MainWorkspace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
