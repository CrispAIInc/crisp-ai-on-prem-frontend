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
  const {
    theme,
    setSourcesTobeCommited,
    knowledgeBase,
    setChatLoaded,
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

  useEffect(() => {
    async function intializeContent() {
      const { chat_is_initialized } = await makeApiRequest(
        `/chat/all`,
        "post",
        JSON.stringify({
          sources: [],
          category: "all",
          selectedAll: false,
          is_exclusive: false
        })
      );
      setChatLoaded(chat_is_initialized);
    }

    intializeContent();
  }, []);

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
