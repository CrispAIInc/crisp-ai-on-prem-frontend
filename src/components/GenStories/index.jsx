import { useContext, useState, useRef } from 'react';
import CustomButton from "../CustomButton";

import { MainContext } from "../../contexts/mainContext";
import GenStoriesLLMModal from '../GenStoriesLLMModal';
import CustomInput from '../CustomInput';

import SendIcon from "@mui/icons-material/Send";
import makeApiRequest from '../../api';

const GenStories = () => {

    const [showLLMModal, setShowLLMModal] = useState(false);
    const [input, setInput] = useState("");

    const chatAppRef = useRef();

    const { theme, selectedGenStoriesModels, setSelectedGenStoriesModels, llmModels } = useContext(MainContext);


    const onHideLLMModal = () => {
        setShowLLMModal(false);
    };

    const sendQuery = async (query) => {
        const data = await makeApiRequest(`/llm-chat/${selectedGenStoriesModels}`, 'post', { query });
    };

    return (
        <div className="relative flex flex-col flex-1 h-full overflow-y-auto">

            {/* models button */}
            <div className="flex flex-wrap items-center justify-center gap-3">
                <CustomButton
                    className={`my-0 ${theme === "light"
                        ? "bg-white !text-dark border border-textColor-100"
                        : " !text-textColor-100 !border !border-textColor-300"
                        }`}
                    onClick={() => setShowLLMModal(true)}
                    style={{ width: "100%" }}
                >
                    Models
                </CustomButton>
                <GenStoriesLLMModal
                    show={showLLMModal}
                    onHide={onHideLLMModal}
                    selectedGenStoriesModels={selectedGenStoriesModels}
                    setSelectedGenStoriesModels={setSelectedGenStoriesModels}
                    llmModels={llmModels}
                    className="modal"
                />
            </div>

            {/* selected models */}
            <div className="flex items-center gap-1 mx-2 my-3">
                <span
                    className={`text-xs ${theme === "light" ? "text-textColor-300" : "text-textColor-200"
                        }`}
                >
                    Selected models:{" "}
                </span>
                <div
                    className={`flex items-center divide-x  ${theme === "light" ? "divide-textColor-100" : "divide-textColor-300"
                        }`}
                >
                    {
                        selectedGenStoriesModels.length === 0 ? (
                            <span
                                className={`text-xs ${theme === "light" ? "text-textColor-300" : "text-textColor-200"
                                    }`}
                            >
                                none
                            </span>
                        ) : (
                            selectedGenStoriesModels.map((model, index) => (
                                <span
                                    key={index}
                                    className={`text-xs ${theme === "light"
                                        ? "text-textColor-300"
                                        : "text-textColor-200"
                                        }`}
                                >
                                    {model.toUpperCase()}{" "}
                                </span>
                            ))
                        )}
                </div>
                {/* <BaseHeading text={`Selected models: ${selectedLLMs[0] || "None"}`} /> */}
            </div>

            <div
                className={`flex flex-col flex-1 flex-grow h-full gap-3 py-3 overflow-y-auto ${theme === "light" ? "!border" : "!border !border-textColor-300"
                    }`}
                ref={chatAppRef}
            >
                genstories copilot
            </div>

            <div className="flex items-center gap-2 input-area">
                <CustomInput
                    placeholder="Message model..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === "Enter") {
                            sendQuery(input);
                        }
                    }}
                />
                <div
                    className={`p-2 rounded-md cursor-pointer ${theme === "light" ? "border" : "!border !border-textColor-300"
                        }`}
                    onClick={() => sendQuery(input)}
                >
                    <SendIcon color="primary" />
                </div>
            </div>
        </div>
    );
};

export default GenStories;