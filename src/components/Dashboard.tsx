import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Coins, Send, History, Box, LogOut } from 'lucide-react';
import TransferModal from './TransferModal';

const Dashboard: React.FC = () => {
  const { currentUser, logout, getHistory } = useGame();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'history'>('inventory');

  const history = getHistory();
  const inventory = currentUser?.inventory || [];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      {/* Header Stat Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row justify-between items-center bg-rpg-dark/80 backdrop-blur-md p-6 rounded-2xl border border-gold/30 shadow-lg shadow-gold/5 mb-8 gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-black font-fantasy text-2xl border-4 border-rpg-black shadow-inner">
            {currentUser?.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-fantasy text-white tracking-wide">{currentUser?.username}</h2>
            <div className="flex items-center gap-2 text-gold-dark font-mono font-bold text-lg">
              <Coins className="w-5 h-5 text-gold" />
              <span>{currentUser?.gold.toLocaleString()} G</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rpg-accent border border-gold/30 rounded-lg hover:bg-gold/10 hover:border-gold transition-all text-sm"
          >
            <Send className="w-4 h-4 text-gold" /> Transfer
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-red-900/20 border border-red-500/30 rounded-lg hover:bg-red-900/40 hover:border-red-500 transition-all text-sm text-red-400"
          >
            <LogOut className="w-4 h-4" /> Logout
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Left Column: Stats/Menu */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-rpg-dark/60 rounded-xl p-4 border border-white/5">
            <h3 className="font-fantasy text-gold mb-4 text-lg border-b border-white/10 pb-2">Journal</h3>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all mb-2 ${activeTab === 'inventory' ? 'bg-gold/20 text-gold border border-gold/30' : 'hover:bg-white/5 text-gray-400'}`}
            >
              <Box className="w-5 h-5" /> Inventory
              <span className="ml-auto bg-black/40 px-2 py-0.5 rounded text-xs">{inventory.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'history' ? 'bg-gold/20 text-gold border border-gold/30' : 'hover:bg-white/5 text-gray-400'}`}
            >
              <History className="w-5 h-5" /> History
              <span className="ml-auto bg-black/40 px-2 py-0.5 rounded text-xs">{history.length}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Content */}
        <div className="md:col-span-2">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-rpg-dark/60 rounded-xl p-6 border border-white/5 min-h-[400px]"
          >
            <h3 className="font-fantasy text-2xl text-white mb-6 border-b border-white/10 pb-4">
              {activeTab === 'inventory' ? 'Your Collection' : 'Gacha History'}
            </h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {activeTab === 'inventory' ? (
                inventory.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">No items yet. Go to the Gacha!</div>
                ) : (
                  inventory.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="flex items-center gap-4 bg-black/40 p-3 rounded-lg border border-white/5 hover:border-gold/30 transition-colors group">
                      <div className={`w-12 h-12 rounded bg-gradient-to-br flex items-center justify-center text-xl shadow-lg
                        ${item.rarity === 5 ? 'from-yellow-400 to-orange-600 border-2 border-yellow-300' : ''}
                        ${item.rarity === 4 ? 'from-purple-400 to-indigo-600 border-2 border-purple-300' : ''}
                        ${item.rarity === 3 ? 'from-blue-400 to-cyan-600 border-2 border-blue-300' : ''}
                        ${item.rarity <= 2 ? 'from-gray-600 to-gray-800 border border-gray-500' : ''}
                      `}>
                        {/* Placeholder icon based on type */}
                        {item.type === 'weapon' ? '⚔️' : item.type === 'material' ? '🧱' : '💰'}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className={`font-bold ${item.rarity >= 4 ? 'text-gold' : 'text-gray-200'}`}>{item.name}</h4>
                          <span className="text-xs text-gray-500 uppercase tracking-wider">{item.type}</span>
                        </div>
                        <div className="flex gap-1 mt-1">
                          {[...Array(item.rarity)].map((_, i) => (
                            <span key={i} className="text-yellow-400 text-xs">★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                history.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">No history found.</div>
                ) : (
                  history.map((entry) => (
                    <div key={entry.id} className="flex justify-between items-center bg-black/40 p-3 rounded text-sm border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <span className={`font-bold ${
                            entry.rarity === 5 ? 'text-yellow-400' :
                            entry.rarity === 4 ? 'text-purple-400' :
                            'text-gray-400'
                        }`}>
                          [{entry.rarity}★]
                        </span>
                        <span className="text-white">{entry.itemName}</span>
                      </div>
                      <span className="text-gray-600 text-xs">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {isTransferModalOpen && (
        <TransferModal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
