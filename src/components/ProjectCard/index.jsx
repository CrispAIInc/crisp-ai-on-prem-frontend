import React from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { formatReadableDate } from '../../utils';
import ActionMenu from '../ActionMenu';

const ProjectCard = ({project}) => {
  return (
    <div style={{background: project.thumbnail ? `url('${project.thumbnail}')` : 'none'}} className={`relative  border rounded-2xl p-3 w-80 h-48 ${project.thumbnail ? `!bg-cover !bg-center` : 'bg-[#1E1E1E]'}   shadow-lg transition-shadow duration-300`}>
        {/* top to bottom gradient overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-black rounded-2xl"></div>

        <div className="relative z-50 flex flex-col justify-between h-full ">
            {/* top showcase */}
            <div className="flex items-center justify-between ">
                {/* <MoreVertIcon className="text-white" /> */}
                <ActionMenu
                actions={[
                    {
                        label: "Edit title",
                        icon: <EditOutlinedIcon />,
                        onClick: () => console.log("chat.id"),
                    },
                    {
                        label: "Delete",
                        icon: <DeleteOutlineOutlinedIcon />,
                        onClick: () => console.log("chat.id"),
                    },
                ]}
                />
                <ArrowForwardIosIcon  className="text-white" />
            </div>
            {/* bottom showcase */}
            <div className="font-semibold">
                <h2 className="text-2xl font-semibold mb-2 !text-white line-clamp-2">{project.name}</h2>
                <div className="flex flex-wrap items-center gap-1">
                    <p className="text-[10px] text-white">{formatReadableDate(project.updated_at)} ~ </p>
                    {project.selectedSources && <p className="text-[10px] text-white">{project.selectedSources} Sources.</p>}
                </div>
            </div>
        </div>
    </div>
  )
}

export default ProjectCard