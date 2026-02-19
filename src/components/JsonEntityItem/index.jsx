import React, { useContext, useState } from 'react';
import ActionMenu from '../ActionMenu';
import LoadingSpinner from '../LoadingSpinner';
import { MainContext } from '../../contexts/mainContext';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

const JsonEntityItem = ({ graph, onClick }) => {

    const {
        theme
    } = useContext(MainContext);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    return (
        <div key={graph.id} className={`flex items-center rounded-md cursor-pointer ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-700'} transition-colors`}>
            <ActionMenu
                actions={[
                    {
                        label: "Edit Project",
                        icon: <EditOutlinedIcon />,
                        onClick: (e) => {
                            e.stopPropagation();
                            setIsModalOpen(true);
                        },
                    },
                    {
                        label: "Delete",
                        icon: isDeleting ? <LoadingSpinner isSmall /> : <DeleteOutlineOutlinedIcon />,
                        // onClick: () => setIsDeleteConfirmationOpen(true),
                    },
                ]}
            />
            <p className={`font-semibold ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`} onClick={() => onClick(graph)}>{graph.title}</p>
        </div>
    );
};

export default JsonEntityItem;