export interface Player {
  id: number;
  name: string;
  nickname: string;
  rating: number | string;
}

export interface PlayerFormData {
  name: string;
  nickname: string;
  rating: number | string;
}
