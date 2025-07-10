export interface Player {
  id: number;
  name: string;
  nickname: string;
  rating: number | string;
  tags?: string[];
  tagRatings?: { [tag: string]: number | undefined };
}

export interface PlayerFormData {
  name: string;
  nickname: string;
  rating: number | string;
  tagRatings?: { [tag: string]: number | undefined };
  tags: string[];
}
