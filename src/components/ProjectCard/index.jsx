import React from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { formatReadableDate } from '../../utils';

const ProjectCard = ({project}) => {
  return (
    <div style={{background: project.thumbnail ? `url('${project.thumbnail}')` : '#1E1E1E'}} className={`relative  border rounded-2xl p-3 w-80 h-48 ${project.thumbnail ? `!bg-cover !bg-center` : 'bg-[#1E1E1E]'}   shadow-lg transition-shadow duration-300`}>
        {/* top to bottom gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black rounded-2xl pointer-events-none"></div>

        <div className="relative z-50 flex flex-col justify-between h-full  ">
            {/* top showcase */}
            <div className="flex justify-between items-center ">
                <MoreVertIcon className="text-white" />
                <ArrowForwardIosIcon  className="text-white" />
            </div>
            {/* bottom showcase */}
            <div className="font-semibold">
                <h2 className="text-2xl font-semibold mb-2 !text-white line-clamp-2">{project.title}</h2>
                <div className="flex items-center gap-1 flex-wrap">
                    <p className="text-[10px] text-white">{formatReadableDate(project.created_at)} ~ </p>
                    <p className="text-[10px] text-white">{project.selectedSources} Sources.</p>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ProjectCard