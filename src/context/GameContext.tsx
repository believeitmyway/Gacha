import React, { createContext, useContext, useState, useEffect } from 'react';
import { Item } from '../types';
import { weaponPool, materialPool, goldPool } from '../data/items';

// --- Types ---

interface User {
  id: string;
  username: string;
  password?: string; // In a real app, hash this. For this static app, plain text or simple obfuscation.
  gold: number;
  inventory: Item[];
  history: GachaHistory[];
}

interface GachaHistory {
  id: string;
  itemId: string;
  itemName: string;
  rarity: number;
  type: string;
  timestamp: number;
}

interface GameContextType {
  currentUser: User | null;
  users: User[];
  login: (username: string, password?: string) => boolean;
  register: (username: string, password?: string) => boolean;
  logout: () => void;
  pullGacha: (type: 'weapon' | 'material' | 'gold') => Item | null;
  addGold: (userId: string, amount: number) => void;
  transferGold: (targetUserId: string, amount: number) => boolean;
  getHistory: () => GachaHistory[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// --- Constants ---
const GACHA_COST = 100;
const INITIAL_GOLD = 500;
const STORAGE_KEY = 'gacha_rpg_data';

// --- Helper Functions ---
const generateId = () => Math.random().toString(36).substr(2, 9);

const pickItem = (pool: Item[]): Item => {
  // Simple weighted random:
  // 5 star: 5%
  // 4 star: 15%
  // 3 star: 30%
  // 2 star: 30%
  // 1 star: 20%
  // Adjust these percentages as needed
  const rand = Math.random() * 100;
  let rarityTarget = 1;

  if (rand < 5) rarityTarget = 5;
  else if (rand < 20) rarityTarget = 4;
  else if (rand < 50) rarityTarget = 3;
  else if (rand < 80) rarityTarget = 2;
  else rarityTarget = 1;

  const candidateItems = pool.filter(i => i.rarity === rarityTarget);

  // Fallback if no items of that rarity exist in pool (shouldn't happen with our data)
  if (candidateItems.length === 0) return pool[Math.floor(Math.random() * pool.length)];

  return candidateItems[Math.floor(Math.random() * candidateItems.length)];
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setUsers(parsed.users || []);
        // Optional: Persist session across reloads
        // const savedSessionId = localStorage.getItem('gacha_session_user');
        // if (savedSessionId) {
        //   const found = parsed.users.find((u: User) => u.id === savedSessionId);
        //   if (found) setCurrentUser(found);
        // }
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
  }, []);

  // Save to local storage whenever users change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ users }));
    if (currentUser) {
        // Update current user reference from the users array to keep them in sync
        const updatedUser = users.find(u => u.id === currentUser.id);
        if (updatedUser && updatedUser !== currentUser) {
            setCurrentUser(updatedUser);
        }
    }
  }, [users, currentUser]);


  const login = (username: string, password?: string) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const register = (username: string, password?: string) => {
    if (users.some(u => u.username === username)) return false;

    const newUser: User = {
      id: generateId(),
      username,
      password, // In real app, hash this!
      gold: INITIAL_GOLD,
      inventory: [],
      history: []
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const pullGacha = (type: 'weapon' | 'material' | 'gold'): Item | null => {
    if (!currentUser) return null;
    if (currentUser.gold < GACHA_COST) return null;

    let pool: Item[] = [];
    if (type === 'weapon') pool = weaponPool;
    if (type === 'material') pool = materialPool;
    if (type === 'gold') pool = goldPool;

    const wonItem = pickItem(pool);

    // Create new user state
    const updatedUser = { ...currentUser };
    updatedUser.gold -= GACHA_COST;

    // If it's a gold gacha item, it might have immediate value
    if (type === 'gold' && wonItem.value) {
        updatedUser.gold += wonItem.value;
    } else {
        updatedUser.inventory = [...updatedUser.inventory, wonItem];
    }

    // Add to history
    const historyEntry: GachaHistory = {
        id: generateId(),
        itemId: wonItem.id,
        itemName: wonItem.name,
        rarity: wonItem.rarity,
        type: type,
        timestamp: Date.now()
    };
    updatedUser.history = [historyEntry, ...updatedUser.history];

    // Update state
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);

    return wonItem;
  };

  const addGold = (userId: string, amount: number) => {
    setUsers(users.map(u => {
      if (u.id === userId) {
        return { ...u, gold: u.gold + amount };
      }
      return u;
    }));
  };

  const transferGold = (targetUserId: string, amount: number) => {
      if (!currentUser) return false;
      if (currentUser.gold < amount) return false;

      const targetUser = users.find(u => u.id === targetUserId);
      if (!targetUser) return false;

      // Deduct from current
      const updatedSender = { ...currentUser, gold: currentUser.gold - amount };

      // Add to target
      const updatedUsers = users.map(u => {
          if (u.id === currentUser.id) return updatedSender;
          if (u.id === targetUserId) return { ...u, gold: u.gold + amount };
          return u;
      });

      setUsers(updatedUsers);
      setCurrentUser(updatedSender);
      return true;
  };

  const getHistory = () => {
      return currentUser ? currentUser.history : [];
  };

  return (
    <GameContext.Provider value={{ currentUser, users, login, register, logout, pullGacha, addGold, transferGold, getHistory }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
