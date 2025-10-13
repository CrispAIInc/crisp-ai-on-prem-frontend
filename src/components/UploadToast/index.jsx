import React from "react";
import FakeProgress from '../FakeProgressbar';

export default function UploadToast({ setIsProgressStarted,
    isLoading, isUploadFailed }) {

    return (
        <div className="fixed z-50 p-3 bg-white shadow-2xl bottom-6 right-6 rounded-2xl w-96">
            {/* <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-800">
                    Uploading {progress}%
                </h3>
                <button
                    onClick={onHide}
                    className="text-lg text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>
            </div> */}
            <FakeProgress isUploadFailed={isUploadFailed} setIsProgressStarted={setIsProgressStarted} isLoading={isLoading} />
        </div>
    );
}