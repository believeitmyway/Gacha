export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'material' | 'gold';
  rarity: number;
  description?: string;
  image?: string;
  value?: number;
}
