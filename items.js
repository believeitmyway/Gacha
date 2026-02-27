// items.js - Data for Gacha

// Item Types: 'weapon', 'material', 'gold'
// Rarity: 1-5 (5 is best)

const WEAPON_POOL = [
  { id: 'w5_1', name: 'Legendary Rocket Launcher', type: 'weapon', rarity: 5, description: 'Destroys everything.' },
  { id: 'w5_2', name: 'Ultra Sphere Launcher', type: 'weapon', rarity: 5, description: 'Catch them all.' },
  { id: 'w4_1', name: 'Assault Rifle', type: 'weapon', rarity: 4 },
  { id: 'w4_2', name: 'Pump-action Shotgun', type: 'weapon', rarity: 4 },
  { id: 'w3_1', name: 'Handgun', type: 'weapon', rarity: 3 },
  { id: 'w3_2', name: 'Crossbow', type: 'weapon', rarity: 3 },
  { id: 'w3_3', name: 'Musket', type: 'weapon', rarity: 3 },
  { id: 'w2_1', name: 'Old Bow', type: 'weapon', rarity: 2 },
  { id: 'w2_2', name: 'Stone Spear', type: 'weapon', rarity: 2 },
  { id: 'w2_3', name: 'Makeshift Handgun', type: 'weapon', rarity: 2 },
  { id: 'w1_1', name: 'Wooden Club', type: 'weapon', rarity: 1 },
  { id: 'w1_2', name: 'Stone Pickaxe', type: 'weapon', rarity: 1 },
];

const MATERIAL_POOL = [
  { id: 'm5_1', name: 'Ancient Civilization Parts', type: 'material', rarity: 5 },
  { id: 'm5_2', name: 'Legendary Schematic', type: 'material', rarity: 5 },
  { id: 'm4_1', name: 'High Quality Pal Oil', type: 'material', rarity: 4 },
  { id: 'm4_2', name: 'Polymer', type: 'material', rarity: 4 },
  { id: 'm3_1', name: 'Ingot', type: 'material', rarity: 3 },
  { id: 'm3_2', name: 'Cement', type: 'material', rarity: 3 },
  { id: 'm2_1', name: 'Paldium Fragment', type: 'material', rarity: 2 },
  { id: 'm2_2', name: 'Leather', type: 'material', rarity: 2 },
  { id: 'm1_1', name: 'Wood', type: 'material', rarity: 1 },
  { id: 'm1_2', name: 'Stone', type: 'material', rarity: 1 },
];

const GOLD_POOL = [
  { id: 'g5_1', name: 'Jackpot! 1000G', type: 'gold', rarity: 5, value: 1000 },
  { id: 'g4_1', name: 'Big Bag of Coins (500G)', type: 'gold', rarity: 4, value: 500 },
  { id: 'g3_1', name: 'Pouch of Coins (200G)', type: 'gold', rarity: 3, value: 200 },
  { id: 'g2_1', name: 'Handful of Coins (50G)', type: 'gold', rarity: 2, value: 50 },
  { id: 'g1_1', name: 'Single Coin (10G)', type: 'gold', rarity: 1, value: 10 },
];
