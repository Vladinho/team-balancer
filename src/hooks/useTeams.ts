import { useState } from 'react';
import type { Player } from '../types/player';
import type { Color } from '../types/color';
import getPlayerRating from '../utils/getPlayerRating.ts';

export function useTeams() {
  const [teams, setTeams] = useState<Player[][]>([]);
  const [show, setShow] = useState(false);
  const [colors, setColors] = useState<Record<number, Color>>({});

  const setTeamColor = (id: number, color: Color) => {
    setColors((prev) => ({ ...prev, [id]: color }));
  };

  /**
   * Разбивает выбранных игроков на команды с учётом рейтинга по тегу
   * @param players - все игроки
   * @param selectedIds - id выбранных игроков
   * @param count - количество команд
   * @param splitTag - тег, по которому считаем рейтинг (fallback=5)
   */
  function split(players: Player[], selectedIds: number[], count: number, splitTag: string) {
    // Отфильтровать выбранных игроков
    const sel = players.filter((p) => selectedIds.includes(p.id));

    // Отсортировать по рейтингу по тегу или fallback
    const sorted = [...sel].sort((a, b) => {
      const ra = a.tagRatings?.[splitTag] ?? 5;
      const rb = b.tagRatings?.[splitTag] ?? 5;
      return rb - ra;
    });

    // Инициализировать команды и сумму рейтингов
    const newTeams: Player[][] = Array.from({ length: count }, () => []);
    const sums = Array(count).fill(0);

    // Распределить по алгоритму «самая лёгкая команда получает следующего игрока»
    sorted.forEach((p) => {
      const rating = getPlayerRating(p, splitTag);
      const minSum = Math.min(...sums);
      const candidates = sums
        .map((sum, idx) => (sum === minSum ? idx : -1))
        .filter((idx) => idx !== -1);
      const teamIdx = candidates[Math.floor(Math.random() * candidates.length)];

      newTeams[teamIdx].push(p);
      sums[teamIdx] += rating;
    });

    setTeams(newTeams);
    setShow(true);
  }

  const hide = () => setShow(false);

  return {
    teams,
    show,
    split,
    hide,
    teamColors: colors,
    setTeamColor,
  };
}
