import React, { useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import { MainContext } from '../../contexts/mainContext';

import ReactJson from "@uiw/react-json-view";

import DataObjectIcon from '@mui/icons-material/DataObject';
import JsonViewer from '../JsonViewer';

const data = [
    {
        "checked_sources": [
            {
                "file_type": "video",
                "source_path": "Microsoft's Q1 2024 Earnings Report Breakdown - AI, Financial Performance, and More.mp4"
            },
            {
                "file_type": "pdf",
                "source_path": "MSFT 10K.pdf"
            }
        ],
        "created_at": "2026-01-15T15:42:03.980996",
        "current_session_id": null,
        "doc_id": "HONhlP84VbD7Un2RocJL",
        "is_shared": true,
        "name": "examples 1234",
        "project_id": "5b982dfc-d8b1-414f-b7a2-f0e88a417014",
        "thumbnail": "gs://crispai-app-462614.firebasestorage.app/projects/thumbnails/uCWw2cICQzb2qyqWkwSPqPTzBkV2/5b982dfc-d8b1-414f-b7a2-f0e88a417014.png",
        "unchecked_sources": [],
        "updated_at": "2026-02-15T22:06:15.409334",
        "user_id": "uCWw2cICQzb2qyqWkwSPqPTzBkV2"
    },
    {
        "checked_sources": [],
        "created_at": "2026-01-05T15:29:25.895294",
        "current_session_id": null,
        "doc_id": "qkY8xpoPTe4wESTvbkEk",
        "name": "Bill Gates",
        "project_id": "5d7f10ea-e430-4355-b143-ed605fd333d2",
        "thumbnail": "gs://crispai-app-462614.firebasestorage.app/projects/thumbnails/iLe2orSVmAOcrKnottkqFVYckGf1/5d7f10ea-e430-4355-b143-ed605fd333d2.webp",
        "unchecked_sources": [],
        "updated_at": "2026-01-23T22:06:42.916835",
        "user_id": "iLe2orSVmAOcrKnottkqFVYckGf1"
    },
    {
        "created_at": "2026-01-05T15:28:01.762800",
        "doc_id": "LRXk2aDtIccjGeL7xvIG",
        "name": "Project 103",
        "project_id": "018ff54f-bb2e-4833-b5f4-5332b3fb8800",
        "thumbnail": "gs://crispai-app-462614.firebasestorage.app/projects/thumbnails/iLe2orSVmAOcrKnottkqFVYckGf1/018ff54f-bb2e-4833-b5f4-5332b3fb8800.jpeg",
        "updated_at": "2026-01-05T15:28:01.762800",
        "user_id": "iLe2orSVmAOcrKnottkqFVYckGf1"
    },
    {
        "created_at": "2026-01-05T15:27:16.094797",
        "doc_id": "ZfvjoG6BxaicG7H8oxI6",
        "name": "Project 102 updated",
        "project_id": "c23d84bd-72d4-47de-82e7-d568558db666",
        "thumbnail": "gs://crispai-app-462614.firebasestorage.app/projects/thumbnails/iLe2orSVmAOcrKnottkqFVYckGf1/c23d84bd-72d4-47de-82e7-d568558db666.png",
        "updated_at": "2026-01-07T00:29:36.356940",
        "user_id": "iLe2orSVmAOcrKnottkqFVYckGf1"
    },
    {
        "checked_sources": [],
        "created_at": "2026-01-04T23:48:56.426663",
        "current_session_id": "7gJvFrlLTq",
        "doc_id": "YqwPC5mEDTq173CuqMHS",
        "name": "Project 101 updated",
        "project_id": "0ca20530-ab27-43d5-a525-3a45fb4e9a48",
        "thumbnail": "gs://crispai-app-462614.firebasestorage.app/projects/thumbnails/iLe2orSVmAOcrKnottkqFVYckGf1/0ca20530-ab27-43d5-a525-3a45fb4e9a48.png",
        "unchecked_sources": [],
        "updated_at": "2026-01-27T14:49:26.634463",
        "user_id": "iLe2orSVmAOcrKnottkqFVYckGf1"
    }
];

const KnowledgeGraphModal = ({ show, onHide }) => {

    const { theme } = useContext(MainContext);

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            className="note-modal"
        >
            <Modal.Header closeButton className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white !border-b-textColor-200'}`}>
                <Modal.Title id="contained-modal-title-vcenter">
                    <div className="flex items-center gap-1">
                        <DataObjectIcon className={`${theme === 'dark' && 'text-textColor-200'}`} fontSize="large" />
                        <p>JSON Structure</p>
                    </div>
                    {/* JSON/Graph switched */}
                    {/* ... */}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
                <JsonViewer data={data} />
            </Modal.Body>
            <Modal.Footer className={`${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
                <div
                    className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={onHide}
                >
                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Ok</span>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default KnowledgeGraphModal;