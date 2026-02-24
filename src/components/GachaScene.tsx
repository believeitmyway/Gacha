import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Item } from '../types';
import { Sword, Hammer, Coins, Star, Loader2, X } from 'lucide-react';

const GachaResult: React.FC<{ item: Item; onClose: () => void; }> = ({ item, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-radial from-gold/10 to-transparent pointer-events-none animate-pulse"></div>

      {/* Light Beams */}
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute w-[800px] h-[800px] bg-gradient-conic from-gold/0 via-gold/20 to-gold/0 opacity-30"
      />

      <motion.div
        initial={{ scale: 0.1, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative z-10 flex flex-col items-center p-4 text-center"
      >
        <div className="mb-8 relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1.2 }}
            transition={{ delay: 0.2, type: "spring" }}
            className={`w-48 h-48 rounded-2xl flex items-center justify-center text-8xl shadow-[0_0_100px_rgba(255,215,0,0.3)]
              ${item.rarity === 5 ? 'bg-gradient-to-br from-yellow-300 via-orange-500 to-red-600 border-4 border-yellow-200' : ''}
              ${item.rarity === 4 ? 'bg-gradient-to-br from-purple-400 via-indigo-600 to-blue-800 border-4 border-purple-300' : ''}
              ${item.rarity === 3 ? 'bg-gradient-to-br from-blue-300 via-blue-500 to-cyan-700 border-4 border-blue-200' : ''}
              ${item.rarity <= 2 ? 'bg-gradient-to-br from-gray-400 via-gray-600 to-gray-800 border-4 border-gray-300' : ''}
            `}
          >
            {/* Placeholder icon */}
            {item.type === 'weapon' ? '⚔️' : item.type === 'material' ? '🧱' : '💰'}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1"
          >
            {[...Array(item.rarity)].map((_, i) => (
              <Star key={i} className="w-8 h-8 text-yellow-400 fill-current drop-shadow-lg" />
            ))}
          </motion.div>
        </div>

        <motion.h2
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className={`text-3xl md:text-5xl font-fantasy text-center mb-4 px-4 drop-shadow-lg
            ${item.rarity === 5 ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-500 to-yellow-300 animate-shine' : 'text-white'}
          `}
        >
          {item.name}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-gray-400 text-lg mb-8 font-fantasy tracking-widest uppercase"
        >
          {item.type} • {item.description || (item.value ? `Value: ${item.value}G` : 'A rare find!')}
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="btn-primary flex items-center gap-2 px-12 py-4 text-xl z-50 pointer-events-auto cursor-pointer"
        >
          <X className="w-6 h-6" /> Close
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

const GachaScene: React.FC = () => {
  const { currentUser, pullGacha } = useGame();
  const [isPulling, setIsPulling] = useState(false);
  const [resultItem, setResultItem] = useState<Item | null>(null);
  const [error, setError] = useState('');

  const handlePull = (type: 'weapon' | 'material' | 'gold') => {
    if (!currentUser || currentUser.gold < 100) {
      setError('Not enough gold! Ask your parents for more.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setIsPulling(true);

    // Simulate animation delay
    setTimeout(() => {
      const item = pullGacha(type);
      setResultItem(item);
      setIsPulling(false);
    }, 2500); // Increased suspense time
  };

  const closeResult = () => {
    setResultItem(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 flex-1 flex flex-col items-center justify-center relative min-h-[60vh]">
      <AnimatePresence>
        {resultItem && (
          <GachaResult item={resultItem} onClose={closeResult} />
        )}
      </AnimatePresence>

      {/* Selection Screen */}
      <h2 className="text-4xl font-fantasy text-gradient-gold mb-12 text-center drop-shadow-lg">
        Choose Your Destiny
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {/* Weapon Card */}
        <motion.button
          whileHover={{ scale: 1.05, y: -10 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePull('weapon')}
          disabled={isPulling}
          className="relative group bg-gradient-to-b from-gray-800 to-black p-1 rounded-2xl shadow-xl hover:shadow-red-500/20 transition-all border border-gray-700 hover:border-red-500 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?q=80&w=2669&auto=format&fit=crop')] bg-cover opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative z-10 p-8 flex flex-col items-center h-full min-h-[300px]">
            <div className="w-24 h-24 rounded-full bg-red-900/50 flex items-center justify-center mb-6 border-2 border-red-500 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(239,68,68,0.4)]">
              <Sword className="w-12 h-12 text-red-400" />
            </div>
            <h3 className="text-2xl font-fantasy text-white mb-2">Weapon Gacha</h3>
            <p className="text-gray-400 text-sm text-center mb-6">Powerful armaments to conquer the lands.</p>
            <div className="mt-auto px-6 py-2 bg-black/60 rounded-full border border-red-500/50 text-red-400 font-bold flex items-center gap-2">
              <Coins className="w-4 h-4" /> 100 G
            </div>
          </div>
        </motion.button>

        {/* Material Card */}
        <motion.button
          whileHover={{ scale: 1.05, y: -10 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePull('material')}
          disabled={isPulling}
          className="relative group bg-gradient-to-b from-gray-800 to-black p-1 rounded-2xl shadow-xl hover:shadow-blue-500/20 transition-all border border-gray-700 hover:border-blue-500 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1621360841012-3f82b7c6c44f?q=80&w=2670&auto=format&fit=crop')] bg-cover opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative z-10 p-8 flex flex-col items-center h-full min-h-[300px]">
            <div className="w-24 h-24 rounded-full bg-blue-900/50 flex items-center justify-center mb-6 border-2 border-blue-500 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(59,130,246,0.4)]">
              <Hammer className="w-12 h-12 text-blue-400" />
            </div>
            <h3 className="text-2xl font-fantasy text-white mb-2">Material Gacha</h3>
            <p className="text-gray-400 text-sm text-center mb-6">Essential resources for crafting and building.</p>
            <div className="mt-auto px-6 py-2 bg-black/60 rounded-full border border-blue-500/50 text-blue-400 font-bold flex items-center gap-2">
              <Coins className="w-4 h-4" /> 100 G
            </div>
          </div>
        </motion.button>

        {/* Gold Card */}
        <motion.button
          whileHover={{ scale: 1.05, y: -10 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePull('gold')}
          disabled={isPulling}
          className="relative group bg-gradient-to-b from-gray-800 to-black p-1 rounded-2xl shadow-xl hover:shadow-gold/20 transition-all border border-gray-700 hover:border-gold overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1629814493203-9d41334c2225?q=80&w=2670&auto=format&fit=crop')] bg-cover opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative z-10 p-8 flex flex-col items-center h-full min-h-[300px]">
            <div className="w-24 h-24 rounded-full bg-yellow-900/50 flex items-center justify-center mb-6 border-2 border-gold group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(255,215,0,0.4)]">
              <Coins className="w-12 h-12 text-gold" />
            </div>
            <h3 className="text-2xl font-fantasy text-gradient-gold mb-2">Gold Gacha</h3>
            <p className="text-gray-400 text-sm text-center mb-6">Test your luck to win massive riches.</p>
            <div className="mt-auto px-6 py-2 bg-black/60 rounded-full border border-gold/50 text-gold font-bold flex items-center gap-2">
              <Coins className="w-4 h-4" /> 100 G
            </div>
          </div>
        </motion.button>
      </div>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-900/90 text-white px-6 py-3 rounded-full border border-red-500 shadow-xl z-50 flex items-center gap-2"
          >
            <X size={16} /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isPulling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center relative">
              {/* Summoning Circle Effect */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-96 h-96 rounded-full border border-gold/20 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 pointer-events-none"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-80 h-80 rounded-full border border-gold/10 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 pointer-events-none"
              />

              <motion.div
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" }, scale: { duration: 1, repeat: Infinity } }}
                className="w-32 h-32 rounded-full border-4 border-t-transparent border-gold mb-8 shadow-[0_0_50px_rgba(255,215,0,0.5)] bg-black/50 backdrop-blur-md flex items-center justify-center"
              >
                <Loader2 className="w-16 h-16 text-gold animate-spin" />
              </motion.div>
              <motion.h2
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-3xl font-fantasy text-gradient-gold tracking-widest uppercase text-center"
              >
                Summoning...
              </motion.h2>
              <p className="text-gray-500 mt-2 text-sm italic">May the RNG gods bless you</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GachaScene;
