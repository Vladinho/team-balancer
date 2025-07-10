import type { Player } from '../types/player.ts';

export const getPlayerRating = (player: Player, splitTag?: string): number => {
  return Number(splitTag ? player.tagRatings?.[splitTag] : player.rating) || 5;
};

export default getPlayerRating;
