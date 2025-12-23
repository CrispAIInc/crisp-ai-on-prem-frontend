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

const MainWorkspace = ({currentProject, setCurrentProject}) => {
  const {
    theme,
    setSourcesTobeCommited,
    knowledgeBase,
    setIsNotesLoading,
    setNotes,
    setSelectedNote,
    setIsStoriesLoading,
    setStories,
    setSelectedStory,
    setCategoryOptions,
    setReels,
  } = useContext(MainContext);

  const { setUser } = useContext(AuthContext);

  const { getReels, getStories, getNotes, getIndexes } = useResources({ setReels, setStories, setNotes, setCategoryOptions });
  useEffect(() => {
    getIndexes();
  }, []);

  // update sourcesTobeCommited depending on knowledgeBase change
  useEffect(() => {
    setSourcesTobeCommited(knowledgeBase.filter((item) => item.is_selected));
  }, [knowledgeBase]);

  useEffect(() => {
    const getAllNotes = async () => {
      try {
        setIsNotesLoading(true);
        getNotes();
        setSelectedNote({
          note_id: "",
          text: [{
            content: "", model: null, color: theme === 'light' ? "#333" : '#fff', question: '', references: {
              videoLinks: [],
              keyframeLinks: [],
              pdfLinks: [],
              imageLinks: [],
            }
          }],
          images: [],
          note_name: "",
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsNotesLoading(false);
      }
    };

    getAllNotes();
  }, []);

  useEffect(() => {
    const getAllStories = async () => {
      try {
        setIsStoriesLoading(true);
        getStories();
        setSelectedStory({
          story_id: "",
          text: [],
          story_name: "",
          models: [],
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsStoriesLoading(false);
      }
    };

    getAllStories();
  }, []);

  useEffect(() => {
    getReels();
  }, []);

  // get user info
  // useEffect(() => {
  //   const getUserInfo = async () => {
  //     try {
  //       const data = await makeApiRequest("/me", "get");
  //       const userWithSpecificProperties = pick(data, ["firstName", "lastName", "email", "username"]);
  //       setUser({
  //         userId: data.user_id,
  //         firstName: data?.display_name.split(" ")[0] ?? data.firstName,
  //         lastName: data?.display_name.split(" ").slice(1).join(" ") ?? data.lastName,
  //         ...userWithSpecificProperties,
  //         emailVerified: data.email_verified,
  //       });
  //     } catch (error) {
  //       console.error("Error fetching user info:", error);
  //     }
  //   };

  //   getUserInfo();
  // }, []);

  console.log("currentProject: ", currentProject)

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
