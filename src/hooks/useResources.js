import { useContext } from 'react';
import { MainContext } from '../contexts/mainContext';
import makeApiRequest from '../api';
import { sortArrayOfObjects } from '../utils';

/**
 * @param {Object} config - Optional config values like setters or extra data.
 */
export default function useResources(config = {}) {
    const { setReels } = useContext(MainContext);

    return {
        getReels: async () => {
            try {
                const data = await makeApiRequest("/reels", "get");
                const sortedData = sortArrayOfObjects(data, 'title');
                if (config.setReels) {
                    config.setReels(sortedData);
                }
            } catch (error) {
                console.error(error);
            }
        }
    };
}