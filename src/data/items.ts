import { Item } from '../types';
import { WEAPON_POOL, MATERIAL_POOL, GOLD_POOL } from './items_data';

// Assign types to the pools
export const weaponPool: Item[] = WEAPON_POOL.map(item => ({ ...item, type: 'weapon', rarity: item.rarity as number, value: 0 })) as Item[];
export const materialPool: Item[] = MATERIAL_POOL.map(item => ({ ...item, type: 'material', rarity: item.rarity as number, value: 0 })) as Item[];
export const goldPool: Item[] = GOLD_POOL.map(item => ({ ...item, type: 'gold', rarity: item.rarity as number, value: item.value })) as Item[];
