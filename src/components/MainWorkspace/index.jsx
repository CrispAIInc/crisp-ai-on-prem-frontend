import { useEffect, useContext } from "react";

// import { MainContext } from "../../contexts/mainContext.jsx";

import makeApiRequest from "../../api";

import ContentPanel from "../ContentPanel";
import Workspace from "../Workspace";
import ChatPanel from "../ChatPanel";

import "bootstrap/dist/css/bootstrap.min.css";
import { MainContext } from '../../contexts/mainContext.jsx';

const MainWorkspace = () => {
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
    setReels,
    setUser,
  } = useContext(MainContext);

  // update sourcesTobeCommited depending on knowledgeBase change
  useEffect(() => {
    setSourcesTobeCommited(knowledgeBase.filter((item) => item.is_selected));
  }, [knowledgeBase]);

  useEffect(() => {
    const getNotes = async () => {
      try {
        setIsNotesLoading(true);
        const data = await makeApiRequest("/notes", "post");
        setNotes(data);
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

    getNotes();
  }, []);

  useEffect(() => {
    const getStories = async () => {
      try {
        setIsStoriesLoading(true);
        const data = await makeApiRequest("/stories", "get");
        setStories(data);
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

    getStories();
  }, []);

  useEffect(() => {
    const getReels = async () => {
      try {
        const data = await makeApiRequest("/reels", "get");
        setReels(data);
      } catch (error) {
        console.error(error);
      }
    };

    getReels();
  }, []);

  // get user info
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const data = await makeApiRequest("/me", "get");
        console.log(data);
        setUser(data);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    getUserInfo();
  }, []);

  return (
    // <MainContext.Provider value={value}>
    <div className="flex relative !h-full divide-x divide-separator main-workspace-container">
      {/* <div className="absolute z-40 w-full h-12">
          <ProgressBar />
        </div> */}
      <ContentPanel />
      <Workspace />
      <ChatPanel />
    </div>
    // </MainContext.Provider>
  );
};

export default MainWorkspace;
