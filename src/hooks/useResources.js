import makeApiRequest from '../api';
import { sortArrayOfObjects } from '../utils';

/**
 * @param {Object} config - Optional config values like setters or extra data.
 */
export default function useResources(config = {}) {

    return {
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
        }
    };
}