export interface Player {
  id: number;
  name: string;
  nickname: string;
  rating: number | string;
  tags?: string[];
}

export interface PlayerFormData {
  name: string;
  nickname: string;
  rating: number | string;
  tags: string[];
}
