import { useState } from 'react';
import type { Player } from '../types/player';

export function useTeams() {
  const [teams, setTeams] = useState<Player[][]>([]);
  const [show, setShow] = useState(false);

  function split(players: Player[], selectedIds: number[], count: number) {
    const sel = players.filter((p) => selectedIds.includes(p.id));
    const sorted = [...sel].sort((a, b) => b.rating - a.rating);

    const newTeams: Player[][] = Array.from({ length: count }, () => []);
    const sums = Array(count).fill(0);

    sorted.forEach((p) => {
      const min = Math.min(...sums);
      const candidates = sums.map((s, i) => (s === min ? i : -1)).filter((i) => i !== -1);
      const idx = candidates[Math.floor(Math.random() * candidates.length)];
      newTeams[idx].push(p);
      sums[idx] += p.rating;
    });

    setTeams(newTeams);
    setShow(true);
  }

  return { teams, show, split, hide: () => setShow(false) };
}
