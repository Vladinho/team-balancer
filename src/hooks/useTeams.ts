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

  // Фишка: Fisher–Yates shuffle
  function shuffleArray<T>(arr: T[]): void {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  // Разбивает массив на чанки size и перемешивает каждый чанк
  function chunkShuffle(players: Player[], size: number): Player[] {
    const result: Player[] = [];
    for (let i = 0; i < players.length; i += size) {
      const chunk = players.slice(i, i + size);
      shuffleArray(chunk);
      result.push(...chunk);
    }
    return result;
  }

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

    // Отсортировать по рейтингу (strongest-first)
    const sortedByRating = [...sel].sort((a, b) => {
      const ra = getPlayerRating(a, splitTag);
      const rb = getPlayerRating(b, splitTag);
      return rb - ra;
    });

    // Добавить случайность внутри «блоков» равной длины count
    const shuffled = chunkShuffle(sortedByRating, count);

    // Инициализировать команды и суммы рейтингов
    const newTeams: Player[][] = Array.from({ length: count }, () => []);
    const sums = Array(count).fill(0);

    // LPT-распределение: следующий игрок идёт в команду с минимальной суммой
    shuffled.forEach((p) => {
      const rating = getPlayerRating(p, splitTag);
      const minSum = Math.min(...sums);
      const teamIdx = sums.indexOf(minSum);
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
