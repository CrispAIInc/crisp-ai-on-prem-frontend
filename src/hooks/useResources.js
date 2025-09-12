import { useContext } from 'react';
import makeApiRequest from '../api';
import { pluck, sortArrayOfObjects, sortStrings } from '../utils';
import { MainContext } from '../contexts/mainContext';

/**
 * @param {Object} config - Optional config values like setters or extra data.
 */
export default function useResources(config = {}) {

    const { categoryOptions } = useContext(MainContext);

    const categoryValuesWithoutAll = categoryOptions.filter(item => item.value !== "all").map((option) => option.value);

    return {
        categoryValuesWithoutAll,
        getReels: async () => {
            try {
                const data = await makeApiRequest("/reels", "get");
                const sortedData = sortArrayOfObjects(data, 'title');
                if (config.setReels) {
                    config.setReels(sortedData);
                }
            } catch (error) {
                console.log(error);
            }
        },

        getStories: async () => {
            try {
                const data = await makeApiRequest("/stories", "get");
                const sortedData = sortArrayOfObjects(data, 'story_name');
                if (config.setStories) {
                    config.setStories(sortedData);
                }
            } catch (error) {
                console.error(error);
            }
        },
        getNotes: async () => {
            try {
                const data = await makeApiRequest("/notes", "get");
                const sortedData = sortArrayOfObjects(data, 'note_name');
                if (config.setNotes) {
                    config.setNotes(sortedData);
                }
            } catch (error) {
                console.error(error);
            }
        },
        getIndexes: async () => {
            let { indexes } = await makeApiRequest("/get-indexes");
            // transform the indexes to the format value/label
            indexes = indexes.map((index) => {
                return {
                    value: index,
                    label: index.charAt(0).toUpperCase() + index.slice(1),
                };
            });

            indexes = [{
                value: "all",
                label: "All"
            }, ...indexes];

            if (config.setCategoryOptions) {
                config.setCategoryOptions(sortStrings(pluck(indexes, "label")).map(item => ({
                    label: item,
                    value: item.charAt(0).toLowerCase() + item.slice(1),
                })));
            }
        }
    };
}