import React, { useContext } from 'react';
import ContentPanel from '../ContentPanel';
import { ProjectContext } from '../../contexts/projectContext';

function Studio() {

    const { setCurrentProject } = useContext(ProjectContext);

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_550px] gap-6 items-start">
                {/* <ContentPanel
                    setCurrentProject={setCurrentProject}
                /> */}
                <p>Right</p>
            </div>
        </div>
    );
}

export default Studio;