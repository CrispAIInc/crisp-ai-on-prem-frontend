import { useMemo, useState } from 'react';

export function useFilter(items, filterFn) {
    const [query, setQuery] = useState('');

    const filteredItems = useMemo(() => {
        if (!query) return items;
        return items.filter(item => filterFn(item, query));
    }, [items, query, filterFn]);

    return {
        query,
        setQuery,
        filteredItems,
    };
}
