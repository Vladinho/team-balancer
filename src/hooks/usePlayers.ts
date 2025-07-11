import { useState, useEffect } from 'react';
import type { Player } from '../types/player';

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

    // 3) мерж: перезаписываем игроков из storage игроками из URL и добавляем новых
    const storageMap = new Map<number, Player>();
    fromStorage.forEach((p) => storageMap.set(p.id, p));
    fromUrl.forEach((p) => storageMap.set(p.id, p));
    const merged: Player[] = Array.from(storageMap.values());

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
