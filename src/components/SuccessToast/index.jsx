import React from "react";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function SuccessToast({ message = "Process done successfully." }) {

    return (
        <div className="fixed z-50 flex gap-2 p-3 bg-white shadow-2xl bottom-6 right-6 rounded-2xl w-96">
            <div>
                <CheckCircleIcon sx={{ fontSize: 48, color: "success.main" }} />
            </div>
            <div className="flex flex-col gap-0">
                <h5 className='text-[1rem] font-medium mb-1'>Success!</h5>
                {message && <span className='text-sm'>{message}</span>}
            </div>
        </div>

    );
}
