import React, { useContext, useState } from 'react';
import ActionMenu from '../ActionMenu';
import LoadingSpinner from '../LoadingSpinner';
import { MainContext } from '../../contexts/mainContext';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import JsonEntityTitleUpdaterModal from '../JsonEntityTitleUpdaterModal';
import makeApiRequest from '../../api';
import { useToast } from '../../contexts/toastContext';

const JsonEntityItem = ({ jsonEntity, onClick }) => {

    const {
        theme,
        setJsonEntities
    } = useContext(MainContext);

    const { notify } = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const { success, message } = await makeApiRequest(`graph/${jsonEntity.graph_id}`, 'DELETE');
            if (success) {
                setJsonEntities(prev => prev.filter(g => g.graph_id !== jsonEntity.graph_id));
                notify({
                    variant: 'success',
                    heading: 'Entity deleted',
                });
            }
            else {
                throw new Error(message);
            }
        } catch (error) {
            console.error("Error deleting entity:", error.message);
            notify({
                variant: 'error',
                heading: 'Error deleting entity',
                subheading: error.message || "An error occurred while deleting the entity. Please try again.",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div key={jsonEntity.id} className={`flex py-2 items-center rounded-md cursor-pointer ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-700'} transition-colors`}>
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
                            onClick: () => handleDelete(),
                        },
                    ]}
                />
                <p className={`font-semibold ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`} onClick={() => onClick(jsonEntity)}>{jsonEntity.title}</p>
            </div>

            {
                isModalOpen && (
                    <JsonEntityTitleUpdaterModal show={isModalOpen} onHide={() => setIsModalOpen(false)} jsonEntity={jsonEntity} />
                )
            }
        </>
    );
};

export default JsonEntityItem;