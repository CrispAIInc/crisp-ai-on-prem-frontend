import React from 'react';
import BaseHeading from '../BaseHeading';

import {
    SearchX
} from "lucide-react";

function DiscoveryNotFound({
    searchQuestion
}) {
    return (
        <div className="flex flex-col items-center justify-center w-full mb-5">
            <div className="flex flex-col items-center justify-center text-center gap-2">
                <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-ink-muted shrink-0">
                    <SearchX size={18} />
                </div>
                <BaseHeading text="No matching sources" className={`!text-sm mt-3 text-textColor-300`} />
                <p className="text-sm">Nothing in your knowledge base matched <span className=" text-primary-300"><q>{searchQuestion}</q></span>.</p>
            </div>

            <div className={`flex flex-col items-center justify-center gap-1 mt-2 text-textColor-300`}>
                <p className="m-0 text-sm">Try:</p>
                <ul className="list-disc list-inside m-0 font-semibold">
                    <li className="text-sm">Using more detailed search query</li>
                    <li className="text-sm">Checking your selected indexes</li>
                    <li className="text-sm">Searching for a broader topic</li>
                </ul>
            </div>
        </div>
    );
}

export default DiscoveryNotFound;