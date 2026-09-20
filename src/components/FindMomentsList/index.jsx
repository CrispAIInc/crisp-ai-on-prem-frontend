import { Info, Layers } from "lucide-react";
import { useContext, useEffect } from 'react';
import { MainContext } from '../../contexts/mainContext';
import EmptyState from '../EmptyState';
import MomentDetails from "../MomentDetails";
import MomentListItem from "../MomentListItem";
import { sortArrayOfObjects } from '../../utils';
import makeApiRequest, { axiosInstance } from '../../api';
import { ProjectContext } from '../../contexts/projectContext';

function FindMomentsList() {

    const {
        currentProject
    } = useContext(ProjectContext);

    const {
        moments,
        currentMoment,
        setMoments,
        knowledgeBase
    } = useContext(MainContext);


    useEffect(() => {

        async function fetchFindMoments() {
            try {
                axiosInstance.defaults.headers.common['ProjectId'] = currentProject.project_id;
                const { data, success } = await makeApiRequest("/moments", 'GET', null, {
                    ProjectId: currentProject.project_id,
                });
                if (success) {

                    let formattedData = data.map((d) => {
                        const finalResults = d.results.map((moment) => {
                            const source = knowledgeBase.find(item => item.source_id === moment.source_id);

                            if (!source) return null;

                            return {
                                ...moment,
                                timestampText: `${source.source_path} | ${moment.timestamp}`,
                                source: {
                                    ...source,
                                    timestamp: moment.timestamp
                                }
                            };
                        }).filter(Boolean);

                        return {
                            ...d,
                            results: finalResults
                        };
                    });

                    setMoments(sortArrayOfObjects(formattedData, "created_at", "desc"));
                }
            } catch (error) {
                console.log(error);
            }
        }

        fetchFindMoments();
    }, [currentProject.project_id, knowledgeBase]);

    return (
        <div className={`h-full min-h-0 flex overflow-hidden`}>
            {/* Left column — list */}
            <div className="w-[280px] shrink-0 border-r border-border h-full min-h-0 overflow-y-auto p-3 flex flex-col gap-2">
                {moments.length === 0 ? (
                    <EmptyState
                        icon={<Info size={20} />}
                        title="No moments found"
                        description="Use left panel to start generating moments."
                    />
                ) : (
                    <MomentListItem />
                )}
            </div>

            {/* Right column — selected segment */}
            <div className="flex-1 min-w-0 h-full min-h-0 overflow-y-auto">
                {(currentMoment === null || currentMoment === undefined) ? (
                    <EmptyState
                        twClasses='flex-1 h-full'
                        icon={<Layers size={20} />}
                        title="Select a moment"
                        description="Pick a moment from the list to see its details."
                    />
                ) : (
                    <div className="p-4 flex flex-col gap-4">
                        <MomentDetails />
                    </div>
                )}
            </div>
        </div>
    );
}

export default FindMomentsList;