import { useCallback, useContext } from 'react';
import { MainContext } from '../contexts/mainContext';
import makeApiRequest from '../api';
import { useToast } from '../contexts/toastContext';

export default function useMetadata() {

    const {
        displayedSources,
        setKnowledgeBase
    } = useContext(MainContext);

    const { notify } = useToast();


    const generateMetadata = useCallback(async (context, verbosityValue, selectedOptions, sources, ...restPayload) => {
        try {
            const payload = {
                sources: sources.map(source => ({ file_type: source.file_type, source_id: source.source_id, index_id: source.index_id })),
                selectedOptions: selectedOptions.map(op => op.id),
                inputContext: context,
                verbosityValue: verbosityValue,
                ...restPayload,
            };

            let { results } = await makeApiRequest('/metadata', 'POST', payload);
            console.log(results);

            setKnowledgeBase(prev => {
                // Build a lookup map from results
                const resultsMap = new Map(
                    results.map(r => [r.source_path, r.metadata])
                );

                return prev.map(item => {
                    // If this item exists in results, update metadata
                    if (resultsMap.has(item.source_path)) {
                        return {
                            ...item,
                            metadata: resultsMap.get(item.source_path),
                        };
                    }

                    // Otherwise, leave it unchanged
                    return item;
                });
            });
        } catch (error) {
            console.error(error);
            notify({
                variant: "error",
                heading: "Oops!",
                subheading: error.message || "You must check at least one metadata option",
            });
        }
    }, [displayedSources, setKnowledgeBase, notify]);

    return {
        generateMetadata
    };
}