import { useState } from 'react';

export function useSelection<T extends number>() {
    const [selected, setSelected] = useState<T[]>([]);

    const toggle = (id: T) =>
        setSelected(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );

    const selectAll = (all: T[]) =>
        setSelected(prev =>
            prev.length === all.length ? [] : [...all]
        );

    return { selected, toggle, selectAll };
}