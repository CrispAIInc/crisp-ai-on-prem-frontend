import { useContext } from 'react';
import { MainContext } from '../contexts/mainContext';
import makeApiRequest from '../api';
import { sortArrayOfObjects } from '../utils';

export default function useResources() {
    const { setReels } = useContext(MainContext);

    return {
        getReels: async () => {
            try {
                const data = await makeApiRequest("/reels", "get");
                const sortedData = sortArrayOfObjects(data, 'title');
                setReels(sortedData);
            } catch (error) {
                console.error(error);
            }
        }
    };
}