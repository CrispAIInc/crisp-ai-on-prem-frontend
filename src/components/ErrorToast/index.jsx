import React from "react";
import ErrorIcon from '@mui/icons-material/Error';

export default function ErrorToast({ reason = "Something went wrong while processing your request." }) {

    return (
        <div className="fixed z-50 flex gap-2 p-3 bg-white shadow-2xl bottom-6 right-6 rounded-2xl w-96">
            <div>
                <ErrorIcon sx={{ fontSize: 48, color: "error.main" }} />
            </div>
            <div className="flex flex-col gap-0">
                <h5 className='text-[1rem] font-medium mb-1'>Oops!</h5>
                <span className='text-sm '>{reason}</span>
            </div>
        </div>

    );
}
