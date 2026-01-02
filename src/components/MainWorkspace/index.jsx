import { useEffect, useContext } from "react";

// import { MainContext } from "../../contexts/mainContext.jsx";

import makeApiRequest from "../../api";

import ContentPanel from "../ContentPanel";
import Workspace from "../Workspace";
import ChatPanel from "../ChatPanel";

import "bootstrap/dist/css/bootstrap.min.css";
import { MainContext } from '../../contexts/mainContext.jsx';
import useResources from '../../hooks/useResources.js';
import { AuthContext } from '../../contexts/authContext.jsx';
import { pick } from '../../utils.js';

const MainWorkspace = ({ currentProject, setCurrentProject }) => {

  return (
    // <MainContext.Provider value={value}>
    <div className="flex relative !h-full divide-x divide-separator main-workspace-container">
      {/* <div className="absolute z-40 w-full h-12">
          <ProgressBar />
        </div> */}
      <ContentPanel setCurrentProject={setCurrentProject} />
      <Workspace />
      <ChatPanel />
    </div>
    // </MainContext.Provider>
  );
};

export default MainWorkspace;
