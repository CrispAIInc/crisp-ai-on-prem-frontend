import { SaveCheck, X } from "lucide-react";
import { useContext, useEffect, useRef, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import makeApiRequest from '../../api';
import { MainContext } from '../../contexts/mainContext';
import { useToast } from '../../contexts/toastContext';
import useReferenceLinkClick from '../../hooks/useReferenceLinkClick';
import BaseHeading from '../BaseHeading';
import Chip from '../Chip';
import RippleButton from '../RippleButton';
import ScoreChip from '../ScoreChip';
import CustomVideoPlayer from '../CustomVideoPlayer';
import { SettingsContext } from '../../contexts/settingsContext';
import useFirebase from '../../hooks/useFirebase';
import { timeToSeconds } from '../../utils';


export default function MomentDetails({ momentDetailsRef }) {

    const {
        theme,
        currentMoment,
        setCurrentMoment,
        setMoments,
        resourceURL,
        setIsPlayerReady,
        setHasDuration,
        player,
        isPlayerReady
    } = useContext(MainContext);

    const { notify } = useToast();

    const { generalSettings: { video_autoplay, video_loop } } = useContext(SettingsContext);

    const { getPublicUrl } = useFirebase();


    const [showSaveTitleModal, setShowSaveTitleModal] = useState(false);
    const [momentTitle, setMomentTitle] = useState(currentMoment?.title || "");
    const [isSaving, setIsSaving] = useState(false);
    const [sourcePublicUrl, setSourcePublicUrl] = useState(null);
    const [source, setSource] = useState(null);

    const containerRef = useRef(null);

    const isContentEmpty = !currentMoment?.refs || currentMoment?.refs?.length === 0;

    // auto scroll down whenever description changes
    useEffect(() => {
        if (!isContentEmpty && containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [isContentEmpty]);


    function onClose() {
        setSource(null);
    }

    async function saveMoment(moment) {
        const momentWithoutSource = {
            ...moment,
            results: moment.results.map(item => {
                const { source, ...rest } = item;

                return rest;
            })
        };

        try {
            const { success, message, id } = await makeApiRequest('/moments/save', 'POST', JSON.stringify({ momentWithoutSource }));

            if (!success) {
                throw new Error(message);
            }

            setMoments(prev => {
                return [
                    {
                        id,
                        ...moment,
                    },
                    ...prev,
                ];
            });
            setCurrentMoment({
                id,
                ...moment,
            });
            notify({
                variant: "success",
                heading: "Moment saved successfully"
            });
        } catch (error) {
            notify({
                variant: "error",
                heading: "Couldn't save moment",
                subheading: error?.message || ""
            });
        }
    }

    async function handleSaveMoment() {
        if (!momentTitle.trim() || isSaving) return;

        setIsSaving(true);
        try {
            await saveMoment({
                ...currentMoment,
                title: momentTitle.trim(),
            });
            setShowSaveTitleModal(false);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleTimestampClick(e, _source) {
        e.preventDefault();

        getPublicUrl(_source.video_url)
            .then(setSourcePublicUrl)
            .catch(console.error);

        setSource(_source);

        setTimeout(() => {
            player?.current?.seekTo(typeof timestamp === "number" ? _source.timestamp : timeToSeconds(_source.timestamp));

            momentDetailsRef?.current?.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }, isPlayerReady ? 500 : 3000);
    }


    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <BaseHeading text="Prompt" className="text-sm text-gradient-x" />
                    <p className={`text-sm/6 ${theme === "light" ? "text-textColor-300" : "text-textColor-100"}`}>{currentMoment?.prompt}</p>
                </div>
                <div className="flex items-center gap-2">
                    {(currentMoment?.id === undefined || currentMoment?.id === null) && (
                        <RippleButton
                            onClick={() => {
                                setMomentTitle(currentMoment?.title || "");
                                setShowSaveTitleModal(true);
                            }}
                            cssClasses="p-2 flex items-center gap-1 text-[8px]"
                        >
                            <SaveCheck size={16} />
                            Save
                        </RippleButton>
                    )}

                    <RippleButton
                        cssClasses="px-2 flex items-center gap-1 py-2 text-sm rounded"
                        onClick={() => setCurrentMoment(null)}
                    >
                        <X size={16} />
                        Close
                    </RippleButton>
                </div>
            </div>

            {/* asset player */}
            {source && <div className="relative">
                <CustomVideoPlayer
                    sourcePublicUrl={sourcePublicUrl}
                    resourceURL={resourceURL}
                    video_autoplay={video_autoplay}
                    video_loop={video_loop}
                    title={source?.source_path}
                    chapters={source?.metadata?.chapters?.content || []}
                    highlights={source?.metadata?.highlights?.content || []}
                    onReady={() => setIsPlayerReady(true)}
                    onDuration={() => setHasDuration(true)}
                    playerRef={player}
                    onClose={onClose}
                />
            </div>}

            <Modal
                show={showSaveTitleModal}
                onHide={() => setShowSaveTitleModal(false)}
                size="md"
                aria-labelledby="contained-modal-title-vcenter"
                scrollable={true}
                centered
                dialogClassName='text-left'
            >
                <Modal.Header className={`border-0 pb-0 ${theme === 'dark' ? '!bg-textColor-300 !text-white' : ''}`}>
                    <div className="flex flex-col gap-1">
                        <Modal.Title id="contained-modal-title-vcenter" className={`text-lg font-semibold ${theme === 'dark' ? 'text-textColor-100' : 'text-gray-900'}`}>
                            Save moment
                        </Modal.Title>
                        <p className={`text-sm m-0 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                            Enter a title for this moment before saving.
                        </p>
                    </div>
                </Modal.Header>
                <Modal.Body className={`${theme === 'dark' ? 'bg-textColor-300 text-white' : ''}`}>
                    <div className='flex flex-col items-start justify-center gap-3'>
                        <div className="flex flex-col w-full">
                            <label htmlFor="saveMomentTitle" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                Moment title
                            </label>
                            <input
                                type="text"
                                name="saveMomentTitle"
                                placeholder='Enter a title for the moment'
                                id='saveMomentTitle'
                                value={momentTitle}
                                onChange={(e) => setMomentTitle(e.target.value)}
                                className={`flex-1 block w-full p-2 mt-1 rounded-xl outline-none transition ${theme === 'dark'
                                    ? '!border !border-textColor-200 bg-textColor-300 text-white placeholder:text-gray-400'
                                    : '!border !border-gray-300 bg-white text-gray-900'}`}
                                required
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveMoment()}
                            />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className={`flex items-center justify-end gap-3 ${theme === 'dark' ? '!bg-textColor-300 !text-white !border-t !border-t-textColor-200' : ''}`}>
                    <button
                        type="button"
                        className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 w-fit transition ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                        onClick={() => setShowSaveTitleModal(false)}
                    >
                        <span className={`select-none font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                            Cancel
                        </span>
                    </button>
                    <button
                        type="button"
                        className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 w-fit transition ${!momentTitle.trim() || isSaving
                            ? 'cursor-not-allowed text-gray-400'
                            : theme === 'dark'
                                ? 'hover:bg-purple-500/20 text-purple-300'
                                : 'hover:bg-purple-50 text-purple-600'}`}
                        onClick={handleSaveMoment}
                        disabled={!momentTitle.trim() || isSaving}
                    >
                        <span className={`select-none font-medium`}>
                            {isSaving ? 'Saving...' : 'Save moment'}
                        </span>
                    </button>
                </Modal.Footer>
            </Modal>

            <div>
                <BaseHeading text="Result" className="text-sm text-gradient-x mt-3 mb-1" />
                {
                    currentMoment?.results.map((moment, index) => (
                        <div key={index} className="mb-4">
                            <p className={`text-sm/6 mb-2 ${theme === "light" ? "text-textColor-300" : "text-textColor-100"}`}>{moment.context}</p>

                            <div className="flex items-center gap-2 flex-wrap">
                                <Chip content={moment.timestampText} data-object={moment?.source} handleClick={(event) => handleTimestampClick(event, moment?.source)} cssClasses="ml-0 cursor-pointer " />
                                {
                                    moment?.score !== undefined && (
                                        <ScoreChip score={moment.score * 100} />
                                    )
                                }
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}