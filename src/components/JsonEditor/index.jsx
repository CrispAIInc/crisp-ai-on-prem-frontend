import React, { useContext, useRef, useState } from "react";
import { MainContext } from '../../contexts/mainContext';

const JsonEditor = ({
    input,
    setInput,
    formatted,
    setFormatted,
}) => {

    const { theme } = useContext(MainContext);

    // const [input, setInput] = useState("");
    // const [formatted, setFormatted] = useState("");
    const [error, setError] = useState("");

    const formatJSON = (json) => {
        try {
            const parsed = JSON.parse(json);
            const pretty = JSON.stringify(parsed, null, 2);
            setFormatted(pretty);
            setError("");
        } catch (err) {
            setError("Invalid JSON");
            setFormatted("");
        }
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setInput(value);
        formatJSON(value);
    };

    const handleFileUpload = (e) => {
        console.log("sdkkk");
        const file = e.target.files[0];
        if (!file) return;

        console.log("sd");
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            setInput(text);
            formatJSON(text);
        };
        reader.readAsText(file);
    };

    // Simple syntax highlighter
    const highlightJSON = (json) => {
        if (!json) return "";

        return json
            .replace(/(&)/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(
                /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(\.\d+)?)/g,
                (match) => {
                    let cls = "text-green-400"; // string

                    if (/^"/.test(match)) {
                        if (/:$/.test(match)) {
                            cls = "text-blue-400"; // key
                        }
                    } else if (/true|false/.test(match)) {
                        cls = "text-purple-400";
                    } else if (/null/.test(match)) {
                        cls = "text-gray-400";
                    } else {
                        cls = "text-yellow-400"; // number
                    }

                    return `<span class="${cls}">${match}</span>`;
                }
            );
    };

    const fileInputRef = useRef(null);

    return (
        <div className="p-4 max-w-6xl mx-auto space-y-4">

            {/* Upload */}
            {/* <button className={`font-medium text-sm p-2 bg-transparent !border ${theme === "dark" ? "text-textColor-100 !border !border-textColor-200/50" : '!border !border-textColor-100'} rounded-xl focus:outline-none`}
                onClick={() => fileInputRef.current.click()}
            >
                Upload
            </button>
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
            /> */}

            {/* Input */}
            <textarea
                value={input}
                onChange={handleChange}
                placeholder="Paste or type JSON here..."
                className="w-full h-48 p-4 border rounded-lg font-mono text-sm bg-gray-900 text-white"
            />

            {/* Error */}
            {error && (
                <div className="text-red-500 font-medium">{error}</div>
            )}

            {/* Output */}
            <div className="bg-gray-900 text-sm rounded-lg p-4 h-52 overflow-auto">
                <pre
                    className="font-mono leading-relaxed"
                    dangerouslySetInnerHTML={{
                        __html: highlightJSON(formatted),
                    }}
                />
            </div>
        </div>
    );
};

export default JsonEditor;