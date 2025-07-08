// hooks/usePlayers.ts
import { useState, useEffect } from 'react';
import type {Player} from '../types/player';

const STORAGE_KEY = 'teamBalancerPlayers';

export function usePlayers(initial: Player[] = []) {
    const [players, setPlayers] = useState<Player[]>(initial);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        // 1) разбор из URL
        let fromUrl: Player[] = [];
        try {
            const params = new URLSearchParams(window.location.search);
            const raw = params.get('players');
            if (raw) {
                fromUrl = JSON.parse(decodeURIComponent(raw));
            }
        } catch {}

        // 2) загрузка из localStorage
        let fromStorage: Player[] = initial;
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                fromStorage = JSON.parse(saved);
            } catch {}
        }

        // 3) мерж (новые из URL + те, которых ещё нет в storage)
        const merged = [...fromStorage];
        fromUrl.forEach(p => {
            if (!merged.find(x => x.id === p.id)) merged.push(p);
        });

        setPlayers(merged);
        setInitialized(true);
    }, []); // только раз при монтировании

    // синхронизируем storage
    useEffect(() => {
        if (initialized) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
        }
    }, [players, initialized]);

    return { players, setPlayers };
}