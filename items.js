// items.js - Data for Gacha

// Item Types: 'weapon', 'material', 'gold'
// Rarity: 1-5 (5 is best)

const WEAPON_POOL = [
  { id: 'w5_1', name: 'レジェンダリーロケットランチャー', type: 'weapon', rarity: 5, description: '全てを破壊する究極の武器。' },
  { id: 'w5_2', name: 'ウルトラスフィアランチャー', type: 'weapon', rarity: 5, description: 'どんなパルも捕まえられる！？' },
  { id: 'w4_1', name: 'アサルトライフル', type: 'weapon', rarity: 4 },
  { id: 'w4_2', name: 'ポンプアクションショットガン', type: 'weapon', rarity: 4 },
  { id: 'w3_1', name: 'ハンドガン', type: 'weapon', rarity: 3 },
  { id: 'w3_2', name: 'クロスボウ', type: 'weapon', rarity: 3 },
  { id: 'w3_3', name: 'マスケット銃', type: 'weapon', rarity: 3 },
  { id: 'w2_1', name: '古びた弓', type: 'weapon', rarity: 2 },
  { id: 'w2_2', name: '石の槍', type: 'weapon', rarity: 2 },
  { id: 'w2_3', name: '粗末なハンドガン', type: 'weapon', rarity: 2 },
  { id: 'w1_1', name: '木の棒', type: 'weapon', rarity: 1 },
  { id: 'w1_2', name: '石のつるはし', type: 'weapon', rarity: 1 },
];

const MATERIAL_POOL = [
  { id: 'm5_1', name: '古代文明の部品', type: 'material', rarity: 5 },
  { id: 'm5_2', name: '伝説の設計図', type: 'material', rarity: 5 },
  { id: 'm4_1', name: '上質なパルオイル', type: 'material', rarity: 4 },
  { id: 'm4_2', name: 'ポリマー', type: 'material', rarity: 4 },
  { id: 'm3_1', name: '金属インゴット', type: 'material', rarity: 3 },
  { id: 'm3_2', name: 'セメント', type: 'material', rarity: 3 },
  { id: 'm2_1', name: 'パルジウムの欠片', type: 'material', rarity: 2 },
  { id: 'm2_2', name: '革', type: 'material', rarity: 2 },
  { id: 'm1_1', name: '木材', type: 'material', rarity: 1 },
  { id: 'm1_2', name: '石', type: 'material', rarity: 1 },
];

const GOLD_POOL = [
  { id: 'g5_1', name: 'ジャックポット！ 1000G', type: 'gold', rarity: 5, value: 1000 },
  { id: 'g4_1', name: '大袋のコイン (500G)', type: 'gold', rarity: 4, value: 500 },
  { id: 'g3_1', name: '小銭入れ (200G)', type: 'gold', rarity: 3, value: 200 },
  { id: 'g2_1', name: '一握りのコイン (50G)', type: 'gold', rarity: 2, value: 50 },
  { id: 'g1_1', name: '1枚のコイン (10G)', type: 'gold', rarity: 1, value: 10 },
];
