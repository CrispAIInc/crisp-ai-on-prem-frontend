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


    const generateMetadata = useCallback(async (context, verbosityValue, selectedOptions) => {

        try {
            const payload = {
                sources: displayedSources.filter(item => item.is_checked).map(source => ({ file_type: source.file_type, source_path: source.source_path, category: Array.isArray(source.category) ? source.category.filter(cat => cat !== "all")[0] : source.category })),
                selectedOptions: selectedOptions.map(op => op.id),
                inputContext: context,
                verbosityValue: verbosityValue
            };

            let { results } = await makeApiRequest('/gen-metadata', 'post', payload);

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
    }, []);

    return {
        generateMetadata
    };
}