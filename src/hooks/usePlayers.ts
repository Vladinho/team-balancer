// hooks/usePlayers.ts
import { useState, useEffect } from 'react';
import type {Player} from '../types/player';

const STORAGE_KEY = 'teamBalancerPlayers';

export function usePlayers(initial: Player[] = []) {
    const [players, setPlayers] = useState<Player[]>(initial);
    const [initialized, setInitialized] = useState(false);

    // загрузка из localStorage — выполняем один раз при монтировании
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setPlayers(JSON.parse(saved));
            } catch {
                setPlayers(initial);
            }
        }
        setInitialized(true);
    }, []); // ← пустой массив зависимостей

    // синхронизация обратно в localStorage
    useEffect(() => {
        if (initialized) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
        }
    }, [players, initialized]);

    return { players, setPlayers };
}